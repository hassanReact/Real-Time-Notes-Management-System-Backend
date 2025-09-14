import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { Notification, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });
  }

  async findAll(queryDto: QueryNotificationsDto, userId: string) {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryDto;

    const skip = (page - 1) * limit;
    const where = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead })
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        }
      }),
      this.prisma.notification.count({ where })
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { 
        id,
        userId // Ensure user can only mark their own notifications
      },
      data: { read: true },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { 
        userId,
        read: false
      },
      data: { read: true }
    });

    return { count: result.count };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { 
        userId,
        read: false
      }
    });

    return { count };
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { 
        id,
        userId // Ensure user can only delete their own notifications
      }
    });
  }

  // Helper methods for creating specific notification types
  async createNoteSharedNotification(noteId: string, noteTitle: string, sharedWithUserId: string, sharedByUserId: string): Promise<Notification> {
    const sharedByUser = await this.prisma.user.findUnique({
      where: { id: sharedByUserId },
      select: { name: true }
    });

    const displayName = sharedByUser?.name || 'Someone';

    return this.create({
      userId: sharedWithUserId,
      type: 'NOTE_SHARED',
      title: 'Note Shared',
      message: `${displayName} shared a note "${noteTitle}" with you`,
      data: { noteId, sharedByUserId }
    });
  }

  async createNoteUpdatedNotification(noteId: string, noteTitle: string, authorId: string, sharedUserIds: string[]): Promise<void> {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { name: true }
    });

    const displayName = author?.name || 'Someone';

    // Create notifications for all users who have access to this note
    const notifications = sharedUserIds.map(userId => ({
      userId,
      type: 'NOTE_UPDATED' as NotificationType,
      title: 'Note Updated',
      message: `${displayName} updated the note "${noteTitle}"`,
      data: { noteId, authorId }
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications
      });
    }
  }
}