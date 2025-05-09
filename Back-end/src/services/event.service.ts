import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export class EventService {
  async createEvent(data: {
    name: string;
    description: string;
    date: Date;
    venue: string;
    quantity: number;
    price: number;
    category: string;
    image?: string;
  }) {
    return prisma.event.create({
      data: {
        ...data,
        isOpen: true,
      },
    });
  }

  async updateEvent(id: number, data: {
    name?: string;
    description?: string;
    date?: Date;
    venue?: string;
    quantity?: number;
    price?: number;
    category?: string;
    image?: string;
  }) {
    return prisma.event.update({
      where: { id },
      data,
    });
  }

  async deleteEvent(id: number) {
    return prisma.event.delete({
      where: { id },
    });
  }

  async toggleEventStatus(id: number) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return prisma.event.update({
      where: { id },
      data: {
        isOpen: !event.isOpen,
      },
    });
  }

  async getAllEvents(page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;
    
    const where = category ? {
      category: category,
    } : {};

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              quantity: true,
              bookingDate: true,
              user: {
                select: {
                  id: true,
                  userName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          date: 'asc',
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEventById(id: number) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            id: true,
            quantity: true,
            bookingDate: true,
            user: {
              select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async getUpcomingEvents(userId?: number, page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;
    const now = new Date();
    
    const where = {
      date: {
        gt: now,
      },
      isOpen: true,
      ...(category ? { category } : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          bookings: {
            where: userId ? {
              userId,
            } : undefined,
            select: {
              id: true,
              quantity: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          date: 'asc',
        },
      }),
      prisma.event.count({ where }),
    ]);

    const formattedEvents = events.map(event => ({
      ...event,
      isBooked: event.bookings.length > 0,
      bookings: undefined,
    }));

    return {
      events: formattedEvents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllCategories() {
    const categories = await prisma.event.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });

    return categories.map(cat => cat.category);
  }
} 