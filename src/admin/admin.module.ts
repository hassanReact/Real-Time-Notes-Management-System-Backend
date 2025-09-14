// Admin Module - Admin functionality ke liye module
// Sirf ADMIN role wale users ye features use kar sakte hain

import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../config/database.module';
import { RedisService } from '@/config/redis.config';

/**
 * Admin Module - Admin ke saare features yahan hain
 * User management, system stats, notes management waghaira
 */
@Module({
  imports: [
    DatabaseModule, // Database access ke liye
  ],
  controllers: [AdminController], // Admin endpoints
  providers: [AdminService, RedisService], // Admin business logic
  exports: [AdminService], // Dusre modules mein use karne ke liye
})
export class AdminModule {}