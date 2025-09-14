// Authentication Module
// Configures and exports authentication-related services and controllers

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RedisService } from '../config/redis.config';
import { JwtConfigService } from '../config/jwt.config';
import { PrismaService } from '../config/database.config';
import { EmailModule } from '../email/email.module';
import { QueueModule } from '../queue/queue.module';
/**
 * Authentication Module
 * Provides authentication functionality for the application
 */
@Module({
  imports: [
    // Passport module for authentication strategies
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT module with dynamic configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    
    // Configuration module for environment variables
    ConfigModule,
    
    // Email module for sending emails
    EmailModule,
    
    // Queue module for background jobs
    QueueModule,
  ],
  
  controllers: [
    AuthController, // REST API endpoints for authentication
  ],
  
  providers: [
    AuthService,        // Core authentication business logic
    JwtStrategy,        // JWT token validation strategy
    LocalStrategy,      // Username/password validation strategy
    PrismaService,    // Database access service
    RedisService,       // Redis caching service
    JwtConfigService,   // JWT configuration service
  ],
  
  exports: [
    AuthService,        // Export for use in other modules
    JwtStrategy,        // Export for guard usage
    PrismaService,    // Export for other modules
    RedisService,       // Export for other modules
  ],
})
export class AuthModule {}