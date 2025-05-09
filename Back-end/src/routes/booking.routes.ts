import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

// Booking routes
router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getUserBookings);
router.delete('/:id', bookingController.cancelBooking);

export default router; 