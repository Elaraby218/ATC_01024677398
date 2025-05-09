import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';

const prisma = new PrismaClient();

export class AuthService {
  private generateTokens(userId: number) {
    const accessToken = jwt.sign(
      { userId },
      authConfig.jwt.accessToken.secret as jwt.Secret,
      { expiresIn: authConfig.jwt.accessToken.expiresIn } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId },
      authConfig.jwt.refreshToken.secret as jwt.Secret,
      { expiresIn: authConfig.jwt.refreshToken.expiresIn } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  async signup(userData: {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    age: number;
  }) {
    const { password, ...rest } = userData;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { userName: userData.userName }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const userRole = await prisma.role.findUnique({
      where: { roleName: 'USER' }
    });

    if (!userRole) {
      throw new Error('Default role not found. Please run the seed script first.');
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...rest,
          password: hashedPassword,
        },
      });

      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: userRole.id,
        },
      });

      return newUser;
    });

    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

 
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        authConfig.jwt.refreshToken.secret
      ) as { userId: number };

      const tokens = this.generateTokens(decoded.userId);

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const decoded = jwt.verify(
        accessToken,
        authConfig.jwt.accessToken.secret
      ) as { userId: number };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          userName: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
} 