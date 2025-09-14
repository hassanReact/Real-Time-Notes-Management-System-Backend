// Authentication Service - Ye file saare login/register ke kaam handle karti hai
// User authentication, JWT tokens, password reset waghaira sab yahan hota hai

import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { EmailService } from '../email/email.service';
import { QueueService } from '../queue/queue.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '@prisma/client';

/**
 * Authentication response interface - Login/Register ke baad jo response milta hai
 */
interface AuthResponse {
    user: Omit<User, 'password' | 'resetToken' | 'resetTokenExp' | 'refreshToken'>; // User data (password exclude)
    accessToken: string; // API access ke liye token
    refreshToken: string; // Token refresh karne ke liye
}

/**
 * Authentication Service - Main authentication class
 * Login, register, password reset, JWT tokens sab yahan handle hota hai
 */
@Injectable()
export class AuthService {
    // Password hashing ke liye salt rounds - security level
    private readonly saltRounds = 12;

    constructor(
        private prisma: PrismaService, // Database operations ke liye
        private jwtService: JwtService, // JWT tokens ke liye
        private configService: ConfigService, // Environment variables ke liye
        private redisService: RedisService, // Caching ke liye
        private emailService: EmailService, // Email bhejne ke liye
        private queueService: QueueService, // Background jobs ke liye
    ) { }

    /**
     * Naya user register karne ke liye
     * Password hash kar ke account banata hai
     */
    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, password, name, phone } = registerDto;

        try {
            // Check if user already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            // Hash the password using bcrypt
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);

            // Create new user in database
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    phone,
                    // Default values are set in schema
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

            // Generate JWT tokens for immediate login
            const tokens = await this.generateTokens(user);

            // Store refresh token in database
            await this.storeRefreshToken(user.id, tokens.refreshToken);

            // Cache user session in Redis
            await this.redisService.cacheUserSession(user.id, user);

            // Send welcome email via queue
            await this.queueService.addEmailJob({
                type: 'welcome',
                email: user.email,
                name: user.name,
            });

            return {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        } catch (error) {
            // Re-throw known exceptions
            if (error instanceof ConflictException) {
                throw error;
            }

            // Log and throw generic error for unexpected issues
            console.error('Registration error:', error);
            throw new BadRequestException('Registration failed');
        }
    }

    /**
     * Authenticate user login
     * Validates credentials and returns tokens
     */
    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        try {
            // Validate user credentials
            const user = await this.validateUser(email, password);

            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Generate new JWT tokens
            const tokens = await this.generateTokens(user);

            // Store refresh token in database
            await this.storeRefreshToken(user.id, tokens.refreshToken);

            // Cache user session in Redis
            await this.redisService.cacheUserSession(user.id, user);

            return {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        } catch (error) {
            // Re-throw known exceptions
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            // Log and throw generic error
            console.error('Login error:', error);
            throw new UnauthorizedException('Authentication failed');
        }
    }

    /**
     * Validate user credentials
     * Used by local strategy and login method
     */
    async validateUser(email: string, password: string): Promise<any> {
        try {
            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            // Check if user exists and is active
            if (!user || !user.isActive) {
                return null;
            }

            // Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return null;
            }

            // Return user without sensitive fields
            const { password: _, resetToken, resetTokenExp, refreshToken, ...result } = user;
            return result;
        } catch (error) {
            console.error('User validation error:', error);
            return null;
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            // Find user and verify refresh token
            const user = await this.prisma.user.findUnique({
                where: {
                    id: payload.sub,
                    refreshToken,
                    isActive: true,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    profilePicture: true,
                },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new access token
            const accessToken = await this.generateAccessToken(user);

            return { accessToken };
        } catch (error) {
            console.error('Token refresh error:', error);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    /**
     * Logout user by invalidating tokens
     */
    async logout(userId: string): Promise<void> {
        try {
            // Remove refresh token from database
            await this.prisma.user.update({
                where: { id: userId },
                data: { refreshToken: null },
            });

            // Clear user session from Redis
            await this.redisService.clearUserSession(userId);
        } catch (error) {
            console.error('Logout error:', error);
            // Don't throw error for logout failures
        }
    }

    /**
     * Initiate password reset process
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
        const { email } = forgotPasswordDto;

        try {
            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            // Always return success to prevent email enumeration
            if (!user) {
                return;
            }

            // Generate reset token and expiration
            const resetToken = uuidv4();
            const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour from now

            // Store reset token in database
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExp,
                },
            });

            // Send password reset email via queue
            await this.queueService.addEmailJob({
                type: 'password-reset',
                email: user.email,
                name: user.name,
                token: resetToken,
            });

            console.log(`Password reset email sent to ${email}`);
        } catch (error) {
            console.error('Forgot password error:', error);
            // Don't throw error to prevent information disclosure
        }
    }

    /**
     * Reset password using reset token
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        const { token, newPassword } = resetPasswordDto;

        try {
            // Find user with valid reset token
            const user = await this.prisma.user.findFirst({
                where: {
                    resetToken: token,
                    resetTokenExp: {
                        gt: new Date(), // Token must not be expired
                    },
                    isActive: true,
                },
            });

            if (!user) {
                throw new BadRequestException('Invalid or expired reset token');
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

            // Update password and clear reset token
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExp: null,
                    refreshToken: null, // Invalidate existing sessions
                },
            });

            // Clear user session from Redis
            await this.redisService.clearUserSession(user.id);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.error('Password reset error:', error);
            throw new BadRequestException('Password reset failed');
        }
    }

    /**
     * Generate JWT access and refresh tokens
     */
    private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        // JWT payload
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        // Generate access token (short-lived)
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
        });

        // Generate refresh token (long-lived)
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
        });

        return { accessToken, refreshToken };
    }

    /**
     * Generate access token only
     */
    private async generateAccessToken(user: any): Promise<string> {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
        });
    }

    /**
     * Store refresh token in database
     */
    private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }
}