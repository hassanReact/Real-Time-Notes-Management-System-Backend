import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: ['NOTE_SHARED', 'NOTE_UPDATED', 'SYSTEM'], description: 'Filter by type' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            userId: 'uuid',
            type: 'NOTE_SHARED',
            title: 'Note Shared',
            message: 'John Doe shared a note "My Important Note" with you',
            data: { noteId: 'uuid', sharedByUserId: 'uuid' },
            isRead: false,
            createdAt: '2023-01-01T00:00:00.000Z',
            user: {
              id: 'uuid',
              email: 'jane@example.com',
              firstName: 'Jane',
              lastName: 'Doe'
            }
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryNotificationsDto, @Request() req: RequestWithUser) {
    return this.notificationsService.findAll(queryDto, req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        type: 'NOTE_SHARED',
        title: 'Note Shared',
        message: 'John Doe shared a note "My Important Note" with you',
        data: { noteId: 'uuid', sharedByUserId: 'uuid' },
        isRead: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        user: {
          id: 'uuid',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      example: { count: 5 }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAllAsRead(@Request() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Unread notifications count',
    schema: {
      example: { count: 3 }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUnreadCount(@Request() req: RequestWithUser) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notificationsService.delete(id, req.user.id);
  }
}