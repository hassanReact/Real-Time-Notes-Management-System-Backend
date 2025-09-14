// Authentication Controller
// Handles HTTP requests for authentication endpoints

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { 
  AuthResponseDto, 
  TokenRefreshResponseDto, 
  SuccessMessageResponseDto 
} from './dto/auth-response.dto';
import { 
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  RateLimitErrorResponseDto 
} from '../common/dto/error-response.dto';

/**
 * Authentication Controller
 * Provides REST API endpoints for user authentication
 */
@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard) // Apply rate limiting to all auth endpoints
@ApiTooManyRequestsResponse({ description: 'Too many requests. Rate limit exceeded.' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   * POST /auth/register
   */
  @ApiOperation({ 
    summary: 'Register a new user account',
    description: 'Creates a new user account with email, password, and profile information. Returns JWT tokens for immediate authentication.'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      example1: {
        summary: 'Sample registration',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          name: 'John Doe',
          phone: '+1234567890'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or user already exists',
    type: ValidationErrorResponseDto
  })
  @Public() // Allow access without authentication
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    // Call auth service to create new user
    const result = await this.authService.register(registerDto);
    
    return {
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  /**
   * Authenticate user login
   * POST /auth/login
   */
  @ApiOperation({ 
    summary: 'Authenticate user login',
    description: 'Validates user credentials and returns JWT tokens for authentication.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Sample login',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    type: UnauthorizedErrorResponseDto
  })
  @Public() // Allow access without authentication
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // Call auth service to authenticate user
    const result = await this.authService.login(loginDto);
    
    return {
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generates a new access token using a valid refresh token.'
  })
  @ApiBody({ 
    type: RefreshTokenDto,
    description: 'Refresh token data',
    examples: {
      example1: {
        summary: 'Sample refresh token',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: TokenRefreshResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or expired refresh token',
    type: UnauthorizedErrorResponseDto
  })
  @Public() // Allow access without authentication
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    // Call auth service to refresh token
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    
    return {
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
    };
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Invalidates user tokens and clears session data.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    type: SuccessMessageResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    // Call auth service to logout user
    await this.authService.logout(user.id);
    
    return {
      message: 'Logout successful',
    };
  }

  /**
   * Initiate password reset
   * POST /auth/forgot-password
   */
  @ApiOperation({ 
    summary: 'Initiate password reset',
    description: 'Sends a password reset email to the user if the email exists in the system.'
  })
  @ApiBody({ 
    type: ForgotPasswordDto,
    description: 'Email for password reset',
    examples: {
      example1: {
        summary: 'Sample forgot password',
        value: {
          email: 'john.doe@example.com'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent (if email exists)',
    type: SuccessMessageResponseDto
  })
  @Public() // Allow access without authentication
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    // Call auth service to initiate password reset
    await this.authService.forgotPassword(forgotPasswordDto);
    
    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  /**
   * Reset password using token
   * POST /auth/reset-password
   */
  @ApiOperation({ 
    summary: 'Reset password using token',
    description: 'Resets user password using a valid reset token received via email.'
  })
  @ApiBody({ 
    type: ResetPasswordDto,
    description: 'Password reset data',
    examples: {
      example1: {
        summary: 'Sample password reset',
        value: {
          token: 'uuid-reset-token-from-email',
          newPassword: 'NewSecurePass123!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successful',
    type: SuccessMessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid or expired reset token',
    type: ValidationErrorResponseDto
  })
  @Public() // Allow access without authentication
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    // Call auth service to reset password
    await this.authService.resetPassword(resetPasswordDto);
    
    return {
      message: 'Password reset successful',
    };
  }
}