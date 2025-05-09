import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, userName } = req.body;
      if (userName) {
        const isAvailable = await this.userService.isUserNameAvailable(userName, userId);
        if (!isAvailable) {
          res.status(400).json({ message: 'Username is already taken' });
          return;
        }
      }

      const updatedUser = await this.userService.updateProfile(userId, {
        firstName,
        lastName,
        userName,
      });

      res.json({
        user: {
          id: updatedUser.id,
          userName: updatedUser.userName,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        res.status(400).json({ message: 'New passwords do not match' });
        return;
      }

      await this.userService.updatePassword(userId, currentPassword, newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to update password' });
    }
  };
} 