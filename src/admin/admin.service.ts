// Admin Service - Admin ke saare kaam yahan handle hote hain
// User management, system stats, notes management waghaira

import { Injectable, ForbiddenException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { User, Note, Role } from '@prisma/client';
import { UpdateNoteDto } from './dto/update-user.dto';
import { RedisService } from '@/config/redis.config';
import { ChangePasswordDto } from '@/users/dto/change-password.dto';
import * as bcrypt from 'bcrypt'
/**
 * Admin Service - Admin ke liye special functions
 * Sirf ADMIN role wale users ye functions use kar sakte hain
 */
@Injectable()
export class AdminService {
    private readonly saltRounds = 12;

    constructor(
        private prisma: PrismaService,
        private redisService: RedisService // Database operations ke liye
    ) { }

    /**
     * Saare users ki list get karne ke liye
     * Admin dashboard mein users show karne ke liye
     */
    async getAllUsers(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        // Total users count aur users list dono get kar rahe hain
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            notes: true, // Har user ke kitne notes hain
                        }
                    }
                },
                orderBy: { createdAt: 'desc' } // Latest users pehle
            }),
            this.prisma.user.count() // Total users count
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * User ko activate/deactivate karne ke liye
     * Admin user ko ban/unban kar sakta hai
     */
    async toggleUserStatus(userId: string, adminId: string) {
        // Check kar rahe hain ke admin khud ko deactivate to nahi kar raha
        if (userId === adminId) {
            throw new ForbiddenException('Admin apne aap ko deactivate nahi kar sakta');
        }

        // User find kar rahe hain
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User nahi mila');
        }

        // User ka status toggle kar rahe hain
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }

    /**
     * User ka role change karne ke liye (USER to ADMIN ya vice versa)
     */
    async changeUserRole(userId: string, newRole: Role, adminId: string) {
        // Admin apna role change nahi kar sakta
        if (userId === adminId) {
            throw new ForbiddenException('Admin apna role change nahi kar sakta');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User nahi mila');
        }

        // Role update kar rahe hain
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }

    /**
     * System ke stats get karne ke liye
     * Dashboard mein show karne ke liye
     */
    async getSystemStats() {
        // Parallel mein saare stats get kar rahe hain performance ke liye
        const [
            totalUsers,
            activeUsers,
            totalNotes,
            publicNotes,
            sharedNotes,
            privateNotes,
            totalNotifications,
            unreadNotifications
        ] = await Promise.all([
            this.prisma.user.count(), // Total users
            this.prisma.user.count({ where: { isActive: true } }), // Active users
            this.prisma.note.count(), // Total notes
            this.prisma.note.count({ where: { visibility: 'PUBLIC' } }), // Public notes
            this.prisma.note.count({ where: { visibility: 'SHARED' } }), // Shared notes
            this.prisma.note.count({ where: { visibility: 'PRIVATE' } }), // Private notes
            this.prisma.notification.count(), // Total notifications
            this.prisma.notification.count({ where: { read: false } }) // Unread notifications
        ]);

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers
            },
            notes: {
                total: totalNotes,
                public: publicNotes,
                shared: sharedNotes,
                private: privateNotes
            },
            notifications: {
                total: totalNotifications,
                unread: unreadNotifications,
                read: totalNotifications - unreadNotifications
            }
        };
    }

    /**
     * Saare notes get karne ke liye (admin view)
     * Admin saare users ke notes dekh sakta hai
     */
    async getAllNotes(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [notes, total] = await Promise.all([
            this.prisma.note.findMany({
                skip,
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    _count: {
                        select: {
                            versions: true, // Kitne versions hain
                            noteUsers: true // Kitne users ke saath shared hai
                        }
                    }
                },
                orderBy: { createdAt: 'desc' } // Latest notes pehle
            }),
            this.prisma.note.count()
        ]);

        return {
            data: notes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Koi bhi note delete karne ke liye (admin power)
     * Admin kisi bhi user ka note delete kar sakta hai
     */
    async deleteNote(noteId: string): Promise<void> {
        const note = await this.prisma.note.findUnique({
            where: { id: noteId }
        });

        if (!note) {
            throw new NotFoundException('Note nahi mila');
        }

        // Note delete kar rahe hain (cascade delete hoga versions aur shares ka)
        await this.prisma.note.delete({
            where: { id: noteId }
        });
    }

    /**
     * User ko permanently delete karne ke liye
     * Ye dangerous operation hai - saare notes bhi delete ho jayenge
     */
    async deleteUser(userId: string, adminId: string): Promise<void> {
        // Admin apne aap ko delete nahi kar sakta
        if (userId === adminId) {
            throw new ForbiddenException('Admin apne aap ko delete nahi kar sakta');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User nahi mila');
        }

        // User delete kar rahe hain (cascade delete hoga saare notes ka)
        await this.prisma.user.delete({
            where: { id: userId }
        });
    }

    /**
     * Recent activity get karne ke liye
     * Dashboard mein recent actions show karne ke liye
     */
    async getRecentActivity(limit: number = 10) {
        // Recent notes aur recent users get kar rahe hain
        const [recentNotes, recentUsers] = await Promise.all([
            this.prisma.note.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            this.prisma.user.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true
                }
            })
        ]);

        return {
            recentNotes,
            recentUsers
        };
    }


    async updateNote(noteId: string, dto: UpdateNoteDto) {
        try {
            // Direct update with upsert-like behavior
            const updatedNote = await this.prisma.note.update({
                where: { id: noteId },
                data: {
                    ...(dto.title && { title: dto.title }),
                    ...(dto.description && { description: dto.description }),
                    ...(dto.tags && { tags: dto.tags }),
                    updatedAt: new Date()
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            return {
                success: true,
                data: updatedNote
            };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Note not found');
            }
            throw new BadRequestException('Failed to update note');
        }
    }

    async changePassword(adminId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;
    
        try {
          // Get user with password
          const user = await this.prisma.user.findUnique({
            where: { 
              id: adminId,
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
            where: { id: adminId },
            data: {
              password: hashedPassword,
              updatedAt: new Date(),
              // Invalidate refresh token for security
              refreshToken: null,
            },
          });
    
          // Clear user session from Redis
          await this.redisService.clearUserSession(adminId);
        } catch (error) {
          if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
            throw error;
          }
    
          console.error('Change password error:', error);
          throw new BadRequestException('Failed to change password');
        }
      }
}