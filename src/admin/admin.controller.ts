// Admin Controller - Admin ke saare endpoints yahan hain
// Sirf ADMIN role wale users ye endpoints access kar sakte hain

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ChangeRoleDto } from './dto/change-role.dto';
import { AdminPaginationDto, ActivityQueryDto } from './dto/admin-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ChangePasswordDto } from '@/users/dto/change-password.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UnauthorizedErrorResponseDto, ValidationErrorResponseDto } from '@/common/dto/error-response.dto';

/**
 * Admin Controller - Admin ke liye special endpoints
 * Sirf ADMIN role wale users access kar sakte hain
 */
@ApiTags('Admin') // Swagger mein "Admin" section banayega
@ApiBearerAuth() // JWT token required hai
@UseGuards(JwtAuthGuard, RolesGuard) // Authentication aur role check
@Roles('ADMIN') // Sirf ADMIN role allow hai
@Controller('admin') // "/admin" routes
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  /**
   * System stats get karne ke liye - GET /admin/stats
   * Dashboard mein overview show karne ke liye
   */
  @Get('stats')
  @ApiOperation({
    summary: 'System statistics get karne ke liye',
    description: 'Users, notes, notifications ke stats return karta hai'
  })
  @ApiResponse({
    status: 200,
    description: 'Stats successfully retrieve ho gaye',
    schema: {
      example: {
        users: { total: 150, active: 140, inactive: 10 },
        notes: { total: 500, public: 50, shared: 200, private: 250 },
        notifications: { total: 1000, unread: 100, read: 900 }
      }
    }
  })
  async getSystemStats() {
    // System ke saare stats get kar rahe hain
    return this.adminService.getSystemStats();
  }

  /**
   * Saare users ki list - GET /admin/users
   * Admin panel mein users manage karne ke liye
   */
  @Get('users')
  @ApiOperation({
    summary: 'Saare users ki list get karne ke liye',
    description: 'Pagination ke saath users ki complete list'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Users list successfully mil gayi',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            email: 'user@example.com',
            username: 'user123',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
            isActive: true,
            createdAt: '2023-01-01T00:00:00.000Z',
            _count: { notes: 5 }
          }
        ],
        meta: { total: 100, page: 1, limit: 10, totalPages: 10 }
      }
    }
  })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    // Query parameters ko numbers mein convert kar rahe hain
    return this.adminService.getAllUsers(parseInt(page), parseInt(limit));
  }

  /**
   * User ka status toggle karne ke liye - POST /admin/users/:id/toggle-status
   * User ko activate/deactivate karne ke liye
   */
  @Post('users/:id/toggle-status')
  @ApiOperation({
    summary: 'User ka status change karne ke liye',
    description: 'User ko active/inactive kar sakta hai'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User status successfully change ho gaya'
  })
  async toggleUserStatus(
    @Param('id') userId: string,
    @Request() req: RequestWithUser
  ) {
    // User ka status toggle kar rahe hain
    return this.adminService.toggleUserStatus(userId, req.user.id);
  }

  /**
   * User ka role change karne ke liye - POST /admin/users/:id/change-role
   * USER ko ADMIN banane ke liye ya vice versa
   */
  @Post('users/:id/change-role')
  @ApiOperation({
    summary: 'User ka role change karne ke liye',
    description: 'USER ko ADMIN bana sakta hai ya ADMIN ko USER'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    type: ChangeRoleDto,
    description: 'New role data',
    examples: {
      makeAdmin: {
        summary: 'User ko Admin banane ke liye',
        value: { role: 'ADMIN' }
      },
      makeUser: {
        summary: 'Admin ko User banane ke liye',
        value: { role: 'USER' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User role successfully change ho gaya'
  })
  async changeUserRole(
    @Param('id') userId: string,
    @Body() changeRoleDto: ChangeRoleDto,
    @Request() req: RequestWithUser
  ) {
    // User ka role change kar rahe hain
    return this.adminService.changeUserRole(userId, changeRoleDto.role, req.user.id);
  }

  /**
   * User ko delete karne ke liye - DELETE /admin/users/:id
   * Permanent deletion - saare notes bhi delete ho jayenge
   */
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'User ko permanently delete karne ke liye',
    description: 'User aur uske saare notes delete ho jayenge'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User successfully delete ho gaya'
  })
  async deleteUser(
    @Param('id') userId: string,
    @Request() req: RequestWithUser
  ) {
    // User ko permanently delete kar rahe hain
    return this.adminService.deleteUser(userId, req.user.id);
  }

  /**
   * Saare notes ki list - GET /admin/notes
   * Admin saare users ke notes dekh sakta hai
   */
  @Get('notes')
  @ApiOperation({
    summary: 'Saare notes ki list get karne ke liye',
    description: 'System ke saare notes with author details'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Notes list successfully mil gayi'
  })
  async getAllNotes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    // Saare notes get kar rahe hain
    return this.adminService.getAllNotes(parseInt(page), parseInt(limit));
  }

  /**
   * Note delete karne ke liye - DELETE /admin/notes/:id
   * Admin kisi bhi user ka note delete kar sakta hai
   */
  @Delete('notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Note delete karne ke liye',
    description: 'Admin kisi bhi note ko delete kar sakta hai'
  })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 204,
    description: 'Note successfully delete ho gaya'
  })
  async deleteNote(@Param('id') noteId: string) {
    // Note delete kar rahe hain
    return this.adminService.deleteNote(noteId);
  }

  /**
   * Recent activity get karne ke liye - GET /admin/activity
   * Dashboard mein recent actions show karne ke liye
   */
  @Get('activity')
  @ApiOperation({
    summary: 'Recent activity get karne ke liye',
    description: 'Recent notes aur users ki activity'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity successfully mil gayi'
  })
  async getRecentActivity(@Query('limit') limit: string = '10') {
    // Recent activity get kar rahe hain
    return this.adminService.getRecentActivity(parseInt(limit));
  }


  @Put('update/notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Note update karne ke liye',
    description: 'Admin kisi bhi note ko update kar sakta hai'
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 204,
    description: 'Note successfully update ho gaya ho gaya'
  })
  async updateNote(
    @Param('id') noteId: string,
    @Body() dto: { description: string, tags: string[], title: string }
  ) {
    // Note delete kar rahe hain
    return this.adminService.updateNote(noteId, dto);
  }

  
  @ApiOperation({
    summary: 'Change admin password',
    description: 'Allows authenticated admin to change their account password'
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Password change data',
    examples: {
      example1: {
        summary: 'Change password request',
        value: {
          currentPassword: 'currentPass123',
          newPassword: 'newPass123',
          confirmPassword: 'newPass123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully'
  })
  @ApiUnauthorizedResponse({
    description: 'Current password is incorrect',
    type: UnauthorizedErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid password data',
    type: ValidationErrorResponseDto
  })
  @Put('change/password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.adminService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }
}