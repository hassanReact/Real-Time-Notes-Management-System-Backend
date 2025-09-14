// JWT Strategy for Passport authentication
// Handles JWT token validation and user extraction

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/database.config';

/**
 * JWT payload interface
 * Defines the structure of JWT token payload
 */
export interface JwtPayload {
  sub: string; // Subject (user ID)
  email: string; // User email
  role: string; // User role
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}

/**
 * JWT Strategy
 * Validates JWT tokens and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Don't ignore token expiration
      ignoreExpiration: false,
      // Secret key for token verification
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validate JWT payload and return user
   * Called automatically by Passport after token verification
   */
  async validate(payload: JwtPayload) {
    try {
      // Extract user ID from payload
      const userId = payload.sub;

      // Find user in database to ensure they still exist and are active
      const user = await this.prismaService.user.findUnique({
        where: { 
          id: userId,
          isActive: true, // Only allow active users
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields like password and tokens
        },
      });

      // If user not found or inactive, deny access
      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Verify email matches (additional security check)
      if (user.email !== payload.email) {
        throw new UnauthorizedException('Token email mismatch');
      }

      // Return user object (will be attached to request.user)
      return user;
    } catch (error) {
      // Log validation error for debugging
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}