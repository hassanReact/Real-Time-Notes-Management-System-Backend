// Analytics Controller
// Provides analytics endpoints for admin users

import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // Only admins can access analytics
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get note analytics
   * GET /analytics/notes/:noteId
   */
  @Get('notes/:noteId')
  @ApiOperation({
    summary: 'Get note analytics',
    description: 'Returns analytics data for a specific note including view counts and trends.',
  })
  @ApiParam({
    name: 'noteId',
    description: 'Note ID to get analytics for',
    example: 'clx1234567890',
  })
  @ApiQuery({
    name: 'days',
    description: 'Number of days to include in analytics',
    required: false,
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Note analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          totalViews: 150,
          recentViews: 45,
          uniqueViewers: 23,
          period: '30 days',
        },
      },
    },
  })
  async getNoteAnalytics(
    @Param('noteId') noteId: string,
    @Query('days') days: string = '30',
  ) {
    const analytics = await this.analyticsService.getNoteAnalytics(
      noteId,
      parseInt(days),
    );

    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Get user analytics
   * GET /analytics/users/:userId
   */
  @Get('users/:userId')
  @ApiOperation({
    summary: 'Get user analytics',
    description: 'Returns analytics data for a specific user including activity patterns.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to get analytics for',
    example: 'clx1234567890',
  })
  @ApiQuery({
    name: 'days',
    description: 'Number of days to include in analytics',
    required: false,
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          totalActivities: 250,
          recentActivities: 45,
          noteViews: 23,
          activityBreakdown: [
            { activity: 'note_create', count: 5 },
            { activity: 'note_edit', count: 12 },
            { activity: 'login', count: 8 },
          ],
          period: '30 days',
        },
      },
    },
  })
  async getUserAnalytics(
    @Param('userId') userId: string,
    @Query('days') days: string = '30',
  ) {
    const analytics = await this.analyticsService.getUserAnalytics(
      userId,
      parseInt(days),
    );

    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Get system analytics
   * GET /analytics/system
   */
  @Get('system')
  @ApiOperation({
    summary: 'Get system analytics',
    description: 'Returns overall system analytics including user counts and activity metrics.',
  })
  @ApiQuery({
    name: 'days',
    description: 'Number of days to include in analytics',
    required: false,
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'System analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          totalUsers: 150,
          activeUsers: 45,
          totalNotes: 500,
          totalViews: 1200,
          period: '7 days',
        },
      },
    },
  })
  async getSystemAnalytics(@Query('days') days: string = '7') {
    const analytics = await this.analyticsService.getSystemAnalytics(
      parseInt(days),
    );

    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Get current user analytics
   * GET /analytics/me
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user analytics',
    description: 'Returns analytics data for the currently authenticated user.',
  })
  @ApiQuery({
    name: 'days',
    description: 'Number of days to include in analytics',
    required: false,
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
  })
  async getMyAnalytics(
    @Request() req: RequestWithUser,
    @Query('days') days: string = '30',
  ) {
    const analytics = await this.analyticsService.getUserAnalytics(
      req.user.id,
      parseInt(days),
    );

    return {
      success: true,
      data: analytics,
    };
  }
}
