// Local Strategy for Passport authentication
// Handles username/password authentication for login

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Local Strategy
 * Validates user credentials using email and password
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // Use email field instead of default username
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * Validate user credentials
   * Called automatically by Passport during login
   */
  async validate(email: string, password: string): Promise<any> {
    try {
      // Validate user credentials using auth service
      const user = await this.authService.validateUser(email, password);

      // If validation fails, throw unauthorized exception
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Return validated user (will be attached to request.user)
      return user;
    } catch (error) {
      // Log validation error for debugging
      console.error('Local strategy validation error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}