// JWT configuration module
// Centralizes JWT settings and provides configuration for authentication

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT configuration service
 * Provides centralized access to JWT-related configuration values
 */
@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private configService: ConfigService) {}

  /**
   * Get JWT secret key for token signing
   * Falls back to default if not set in environment
   */
  get secret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'fallback-secret-key';
  }

  /**
   * Get access token expiration time
   * Default: 15 minutes for security
   */
  get expiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
  }

  /**
   * Get refresh token expiration time
   * Default: 7 days for user convenience
   */
  get refreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  /**
   * Create JWT options for module registration
   * Required by JwtOptionsFactory interface
   */
  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.secret,
      signOptions: {
        expiresIn: this.expiresIn,
      },
    };
  }

  /**
   * Get complete JWT module configuration
   * Used by NestJS JWT module registration
   */
  getJwtModuleOptions() {
    return {
      secret: this.secret,
      signOptions: {
        expiresIn: this.expiresIn,
      },
    };
  }

  /**
   * Get refresh token configuration
   * Used for generating refresh tokens with longer expiration
   */
  getRefreshTokenOptions() {
    return {
      secret: this.secret,
      signOptions: {
        expiresIn: this.refreshExpiresIn,
      },
    };
  }
}

/**
 * JWT configuration factory function
 * Used for dynamic module registration in app.module.ts
 */
export const jwtConfigFactory = {
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
    },
  }),
  inject: [ConfigService],
};