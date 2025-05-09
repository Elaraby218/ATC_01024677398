import { Router, Request, Response, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();


router.post('/signup', authController.signup as RequestHandler);
router.post('/login', authController.login as RequestHandler);
router.post('/refresh', authController.refresh as RequestHandler);

router.post('/logout', authenticate, authController.logout as RequestHandler);

export const authRouter = router; 