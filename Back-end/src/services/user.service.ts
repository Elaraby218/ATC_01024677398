import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  async isUserNameAvailable(userName: string, currentUserId: number): Promise<boolean> {
    const existingUser = await prisma.user.findFirst({
      where: {
        userName,
        id: { not: currentUserId }
      }
    });
    return !existingUser;
  }

  async updateProfile(
    userId: number,
    data: {
      firstName?: string;
      lastName?: string;
      userName?: string;
    }
  ) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        userName: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return updatedUser;
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
} 