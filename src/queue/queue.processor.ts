// Queue Processor
// Processes background jobs from the queue

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueService, EmailJobData } from './queue.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private queueService: QueueService) {}

  @Process('send-email')
  async handleEmailJob(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id}: ${job.data.type}`);
    
    try {
      await this.queueService.processEmailJob(job.data);
      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`);
      throw error; // This will mark the job as failed
    }
  }
}
