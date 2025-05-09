import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, quantity } = req.body;
      const userId = req.user!.id;

      const booking = await this.bookingService.createBooking(userId, eventId, quantity);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Event not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        if (error.message === 'Event is not open for booking' || 
            error.message === 'You have already booked this event' ||
            error.message === 'Not enough tickets available' ||
            error.message.startsWith('Cannot book more than')) {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Failed to create booking' });
    }
  };

  getUserBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.bookingService.getUserBookings(userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  };

  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await this.bookingService.cancelBooking(bookingId, userId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Booking not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        if (error.message === 'You can only cancel your own bookings') {
          res.status(403).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Failed to cancel booking' });
    }
  };
} 