// Analytics Service
// Handles user behavior tracking and system metrics

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { Request } from 'express';

export interface NoteViewData {
  noteId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserActivityData {
  userId: string;
  activity: string;
  description?: string;
  metadata?: any;
}

export interface SystemMetricData {
  metric: string;
  value: number;
  unit?: string;
  metadata?: any;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track note view
   */
  async trackNoteView(data: NoteViewData): Promise<void> {
    try {
      await this.prisma.noteView.create({
        data: {
          noteId: data.noteId,
          userId: data.userId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      this.logger.log(`Note view tracked: ${data.noteId} by ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to track note view: ${error.message}`);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Track user activity
   */
  async trackUserActivity(data: UserActivityData): Promise<void> {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId: data.userId,
          activity: data.activity,
          description: data.description,
          metadata: data.metadata,
        },
      });

      this.logger.log(`User activity tracked: ${data.activity} by ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to track user activity: ${error.message}`);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Track system metric
   */
  async trackSystemMetric(data: SystemMetricData): Promise<void> {
    try {
      await this.prisma.systemMetric.create({
        data: {
          metric: data.metric,
          value: data.value,
          unit: data.unit,
          metadata: data.metadata,
        },
      });

      this.logger.log(`System metric tracked: ${data.metric} = ${data.value}`);
    } catch (error) {
      this.logger.error(`Failed to track system metric: ${error.message}`);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Get note analytics
   */
  async getNoteAnalytics(noteId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalViews, recentViews, uniqueViewers] = await Promise.all([
      this.prisma.noteView.count({
        where: { noteId },
      }),
      this.prisma.noteView.count({
        where: {
          noteId,
          viewedAt: { gte: startDate },
        },
      }),
      this.prisma.noteView.groupBy({
        by: ['userId'],
        where: { noteId },
        _count: { userId: true },
      }),
    ]);

    return {
      totalViews,
      recentViews,
      uniqueViewers: uniqueViewers.length,
      period: `${days} days`,
    };
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalActivities, recentActivities, noteViews] = await Promise.all([
      this.prisma.userActivity.count({
        where: { userId },
      }),
      this.prisma.userActivity.count({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.noteView.count({
        where: {
          userId,
          viewedAt: { gte: startDate },
        },
      }),
    ]);

    // Get activity breakdown
    const activityBreakdown = await this.prisma.userActivity.groupBy({
      by: ['activity'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: { activity: true },
    });

    return {
      totalActivities,
      recentActivities,
      noteViews,
      activityBreakdown: activityBreakdown.map(item => ({
        activity: item.activity,
        count: item._count.activity,
      })),
      period: `${days} days`,
    };
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalUsers, activeUsers, totalNotes, totalViews] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.userActivity.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: { userId: true },
      }),
      this.prisma.note.count(),
      this.prisma.noteView.count({
        where: { viewedAt: { gte: startDate } },
      }),
    ]);

    return {
      totalUsers,
      activeUsers: activeUsers.length,
      totalNotes,
      totalViews,
      period: `${days} days`,
    };
  }

  /**
   * Extract client info from request
   */
  extractClientInfo(req: Request): { ipAddress?: string; userAgent?: string } {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };
  }
}
