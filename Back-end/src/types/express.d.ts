import { User } from '../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userName: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }
  }
} 