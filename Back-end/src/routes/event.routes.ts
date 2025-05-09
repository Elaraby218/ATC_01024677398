import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/', eventController.getAllEvents);
router.get('/categories/all', eventController.getAllCategories);

// Protected routes (require authentication and admin role)
router.use(authenticate, isAdmin);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.put('/:id/toggle-status', eventController.toggleEventStatus);

export default router; 