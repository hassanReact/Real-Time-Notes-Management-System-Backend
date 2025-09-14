// JWT Authentication Guard
// Protects routes by validating JWT tokens and extracting user information

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 * Extends Passport's AuthGuard to add custom logic for public routes
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determine if the route can be activated
   * Checks for public routes and validates JWT tokens
   */
  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access to public routes without authentication
    if (isPublic) {
      return true;
    }

    // For protected routes, validate JWT token
    return super.canActivate(context);
  }

  /**
   * Handle authentication errors
   * Provides custom error messages for different scenarios
   */
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw unauthorized exception
    if (err || !user) {
      // Provide specific error messages based on JWT validation result
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active');
      }
      
      // Generic unauthorized message
      throw new UnauthorizedException('Authentication required');
    }

    // Return the authenticated user
    return user;
  }
}