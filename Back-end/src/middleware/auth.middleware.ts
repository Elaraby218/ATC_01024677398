import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { authConfig } from '../config/auth.config';

const authService = new AuthService();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    try {
      const user = await authService.verifyAccessToken(accessToken);
      req.user = user;
      next();
    } catch (error) {
      if (!refreshToken) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      try {
        const tokens = await authService.refreshToken(refreshToken);
        res.cookie('accessToken', tokens.accessToken, authConfig.cookie);
        res.cookie('refreshToken', tokens.refreshToken, authConfig.cookie);
        const user = await authService.verifyAccessToken(tokens.accessToken);
        req.user = user;
        next();
      } catch (error) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(401).json({ message: 'Authentication required' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}; 