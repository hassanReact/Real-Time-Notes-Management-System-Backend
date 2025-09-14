// Health Module
// Provides health check functionality

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

/**
 * Health Module
 * Configures health check endpoints and dependencies
 */
@Module({
  controllers: [HealthController],
  providers: [PrismaService, RedisService],
})
export class HealthModule {}