import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await this.eventService.createEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create event' });
    }
  };

  updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await this.eventService.updateEvent(eventId, req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update event' });
    }
  };

  deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      await this.eventService.deleteEvent(eventId);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete event' });
    }
  };

  toggleEventStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await this.eventService.toggleEventStatus(eventId);
      res.json(event);
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      res.status(500).json({ message: 'Failed to toggle event status' });
    }
  };

  getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;

      const result = await this.eventService.getAllEvents(page, limit, category);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  };

  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await this.eventService.getEventById(eventId);
      res.json(event);
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  };

  getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;

      const result = await this.eventService.getUpcomingEvents(userId, page, limit, category);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch upcoming events' });
    }
  };

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.eventService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  };
} 