// Users Service
// Handles user profile management and search functionality

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Users Service
 * Provides user management functionality
 */
@Injectable()
export class UsersService {
  private readonly saltRounds = 12;
  
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Get user profile by ID
   * Returns complete user profile for authenticated user
   */
  async getProfile(userId: string): Promise<Omit<User, 'password' | 'resetToken' | 'resetTokenExp' | 'refreshToken'>> {
    try {
      // Check Redis cache first
      const cacheKey = `user_profile:${userId}`;
      const cachedProfile = await this.redisService.get(cacheKey);
      
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }

      // Fetch from database if not in cache
      const user = await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true, // Only return active users
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          profilePicture: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Cache the profile for 1 hour
      await this.redisService.set(cacheKey, JSON.stringify(user), 3600);

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error('Get profile error:', error);
      throw new BadRequestException('Failed to retrieve user profile');
    }
  }

  /**
   * Update user profile
   * Updates user profile information and clears cache
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password' | 'resetToken' | 'resetTokenExp' | 'refreshToken'>> {
    try {
      // Check if user exists and is active
      const existingUser = await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Update user profile
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...updateProfileDto,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          profilePicture: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Clear cache for updated profile
      const cacheKey = `user_profile:${userId}`;
      await this.redisService.del(cacheKey);

      // Update cached session data
      await this.redisService.cacheUserSession(userId, updatedUser);

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error('Update profile error:', error);
      throw new BadRequestException('Failed to update user profile');
    }
  }

  /**
   * Upload user avatar/profile picture
   * Updates profile picture URL and clears cache
   */
  async uploadAvatar(userId: string, profilePictureUrl: string): Promise<{ profilePicture: string }> {
    try {
      // Check if user exists and is active
      const existingUser = await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Update profile picture
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: profilePictureUrl,
          updatedAt: new Date(),
        },
      });

      // Clear profile cache
      const cacheKey = `user_profile:${userId}`;
      await this.redisService.del(cacheKey);

      return { profilePicture: profilePictureUrl };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error('Upload avatar error:', error);
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  /**
   * Search users for note sharing
   * Returns public user information for sharing functionality
   */
  async searchUsers(searchDto: UserSearchDto): Promise<{ users: any[]; total: number; count: number }> {
    try {
      const { query, limit = 10 } = searchDto;

      // Build search conditions
      const searchConditions = {
        isActive: true, // Only search active users
        ...(query && {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
      };

      // Execute search with pagination
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: searchConditions,
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            // Only return public fields for search
          },
          take: Math.min(limit, 50), // Limit to max 50 results
          orderBy: {
            name: 'asc', // Sort by name alphabetically
          },
        }),
        this.prisma.user.count({
          where: searchConditions,
        }),
      ]);

      return {
        users,
        total,
        count: users.length,
      };
    } catch (error) {
      console.error('Search users error:', error);
      throw new BadRequestException('Failed to search users');
    }
  }

  /**
   * Get user by ID (internal method)
   * Used by other services to get user information
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true,
        },
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Check if user exists and is active
   * Used for validation in other services
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true,
        },
        select: { id: true },
      });

      return !!user;
    } catch (error) {
      console.error('User exists check error:', error);
      return false;
    }
  }

  /**
   * Get multiple users by IDs
   * Used for note sharing and collaboration features
   */
  async getUsersByIds(userIds: string[]): Promise<any[]> {
    try {
      if (userIds.length === 0) {
        return [];
      }

      return await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      });
    } catch (error) {
      console.error('Get users by IDs error:', error);
      return [];
    }
  }

  /**
   * Change user password
   * Validates current password and updates to new password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    try {
      // Get user with password
      const user = await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
          // Invalidate refresh token for security
          refreshToken: null,
        },
      });

      // Clear user session from Redis
      await this.redisService.clearUserSession(userId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Change password error:', error);
      throw new BadRequestException('Failed to change password');
    }
  }

  /**
   * Delete user account
   * Soft deletes the account and clears all sessions
   */
  async deleteAccount(userId: string): Promise<void> {
    try {
      // Check if user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { 
          id: userId,
          isActive: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Soft delete the user account
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          refreshToken: null,
          email: `deleted_${user.email}_${Date.now()}`, // Prevent email reuse
          updatedAt: new Date(),
        },
      });

      // Clear all user data from Redis
      await this.redisService.clearUserSession(userId);
      const cacheKey = `user_profile:${userId}`;
      await this.redisService.del(cacheKey);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Delete account error:', error);
      throw new BadRequestException('Failed to delete account');
    }
  }
}