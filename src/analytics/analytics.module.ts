// Analytics Module
// Handles user behavior tracking and system metrics

import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../config/database.config';

@Module({
  controllers: [
    AnalyticsController, // REST API endpoints for analytics
  ],
  providers: [
    AnalyticsService, // Core analytics business logic
    PrismaService, // Database access service
  ],
  exports: [
    AnalyticsService, // Export for use in other modules
  ],
})
export class AnalyticsModule {}
