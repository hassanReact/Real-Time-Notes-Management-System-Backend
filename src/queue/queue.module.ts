// Queue Module
// Handles background job processing with Bull and Redis

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { EmailProcessor } from './queue.processor';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    // Configure Bull queue with Redis
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    
    // Register email queue
    BullModule.registerQueue({
      name: 'email',
    }),
    
    // Import email module for email service
    EmailModule,
  ],
  providers: [
    QueueService,
    EmailProcessor,
  ],
  exports: [
    QueueService,
    BullModule,
  ],
})
export class QueueModule {}
