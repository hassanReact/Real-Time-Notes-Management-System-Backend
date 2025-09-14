// Users Module
// Configures and exports user management functionality

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { FilesModule } from '../files/files.module';

/**
 * Users Module
 * Provides user profile management and search functionality
 */
@Module({
  imports: [
    FilesModule, // File upload functionality
  ],
  controllers: [
    UsersController, // REST API endpoints for user management
  ],
  
  providers: [
    UsersService,    // Core user management business logic
    PrismaService, // Database access service
    RedisService,    // Redis caching service
  ],
  
  exports: [
    UsersService,    // Export for use in other modules (notes, notifications)
  ],
})
export class UsersModule {}