import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const MAX_TICKETS_PER_BOOKING = 5;

export class BookingService {
  async createBooking(userId: number, eventId: number, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (!event.isOpen) {
        throw new Error('Event is not open for booking');
      }

      if (quantity > MAX_TICKETS_PER_BOOKING) {
        throw new Error(`Cannot book more than ${MAX_TICKETS_PER_BOOKING} tickets at once`);
      }

      if (event.quantity < quantity) {
        throw new Error('Not enough tickets available');
      }

      // Get all previous bookings for this event by the user
      const previousBookings = await tx.booking.findMany({
        where: {
          userId,
          eventId,
        },
        orderBy: {
          bookingDate: 'desc',
        },
      });

      const [booking] = await Promise.all([
        tx.booking.create({
          data: {
            userId,
            eventId,
            quantity,
          },
          include: {
            event: true,
          },
        }),
        tx.event.update({
          where: { id: eventId },
          data: {
            quantity: event.quantity - quantity,
          },
        }),
      ]);

      // Format the response to include previous bookings
      return {
        currentBooking: {
          bookingId: booking.id,
          quantity: booking.quantity,
          bookingDate: booking.bookingDate,
        },
        event: booking.event,
        previousBookings: previousBookings.map(b => ({
          bookingId: b.id,
          quantity: b.quantity,
          bookingDate: b.bookingDate,
        })),
        totalBookings: previousBookings.length + 1,
        totalTickets: previousBookings.reduce((sum, b) => sum + b.quantity, 0) + quantity,
      };
    });
  }

  async getUserBookings(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // First, get all unique events the user has booked
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: {
          userId,
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              description: true,
              date: true,
              venue: true,
              price: true,
              category: true,
              image: true,
              isOpen: true,
            },
          },
        },
        orderBy: {
          bookingDate: 'desc',
        },
      }),
      prisma.booking.count({
        where: {
          userId,
        },
      }),
    ]);

    // Group bookings by event
    const bookingsByEvent = bookings.reduce((acc, booking) => {
      const eventId = booking.eventId;
      if (!acc[eventId]) {
        acc[eventId] = {
          event: booking.event,
          bookingHistory: [],
          totalTickets: 0,
        };
      }
      
      acc[eventId].bookingHistory.push({
        bookingId: booking.id,
        quantity: booking.quantity,
        bookingDate: booking.bookingDate,
      });
      
      acc[eventId].totalTickets += booking.quantity;
      return acc;
    }, {} as Record<number, {
      event: typeof bookings[0]['event'],
      bookingHistory: Array<{
        bookingId: number,
        quantity: number,
        bookingDate: Date
      }>,
      totalTickets: number
    }>);

    // Convert to array and sort by most recent booking
    const events = Object.values(bookingsByEvent)
      .sort((a, b) => {
        const aLatest = a.bookingHistory[0].bookingDate;
        const bLatest = b.bookingHistory[0].bookingDate;
        return bLatest.getTime() - aLatest.getTime();
      });

    // Apply pagination
    const paginatedEvents = events.slice(skip, skip + limit);

    return {
      events: paginatedEvents,
      pagination: {
        total: events.length,
        page,
        limit,
        totalPages: Math.ceil(events.length / limit),
      },
    };
  }

  async cancelBooking(bookingId: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          event: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new Error('You can only cancel your own bookings');
      }

      await Promise.all([
        tx.booking.delete({
          where: { id: bookingId },
        }),
        tx.event.update({
          where: { id: booking.eventId },
          data: {
            quantity: booking.event.quantity + booking.quantity,
          },
        }),
      ]);

      return { message: 'Booking cancelled successfully' };
    });
  }
} 