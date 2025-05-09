import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authConfig } from '../config/auth.config';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      res.cookie('accessToken', result.accessToken, authConfig.cookie);
      res.cookie('refreshToken', result.refreshToken, authConfig.cookie);
      res.status(201).json({ user: result.user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie('accessToken', result.accessToken, authConfig.cookie);
      res.cookie('refreshToken', result.refreshToken, authConfig.cookie);
      res.json({ user: result.user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token required' });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      res.cookie('accessToken', tokens.accessToken, authConfig.cookie);
      res.cookie('refreshToken', tokens.refreshToken, authConfig.cookie);
      res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
} 