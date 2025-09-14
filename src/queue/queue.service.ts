// Queue Service
// Handles background tasks using Bull queue with Redis

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from '../email/email.service';

export interface EmailJobData {
  type: 'welcome' | 'password-reset' | 'notification';
  email: string;
  name?: string;
  token?: string;
  data?: {
    type: 'note_shared' | 'note_updated' | 'note_deleted' | 'system';
    title: string;
    message: string;
    noteTitle?: string;
    noteId?: string;
    sharedBy?: string;
  };
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private emailService: EmailService,
  ) {}

  /**
   * Add email job to queue
   */
  async addEmailJob(jobData: EmailJobData, delay?: number): Promise<void> {
    try {
      const job = await this.emailQueue.add('send-email', jobData, {
        delay: delay || 0,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Email job added to queue: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to add email job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process email jobs
   */
  async processEmailJob(jobData: EmailJobData): Promise<void> {
    try {
      this.logger.log(`Processing email job: ${jobData.type}`);

      switch (jobData.type) {
        case 'welcome':
          await this.emailService.sendWelcomeEmail(jobData.email, jobData.name);
          break;
        case 'password-reset':
          await this.emailService.sendPasswordResetEmail(
            jobData.email,
            jobData.name,
            jobData.token,
          );
          break;
        case 'notification':
          await this.emailService.sendNotificationEmail(
            jobData.email,
            jobData.name,
            jobData.data,
          );
          break;
        default:
          throw new Error(`Unknown email type: ${jobData.type}`);
      }

      this.logger.log(`Email job completed: ${jobData.type}`);
    } catch (error) {
      this.logger.error(`Email job failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<any> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaiting(),
      this.emailQueue.getActive(),
      this.emailQueue.getCompleted(),
      this.emailQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  /**
   * Clear all jobs from queue
   */
  async clearQueue(): Promise<void> {
    await this.emailQueue.empty();
    this.logger.log('Queue cleared');
  }

  /**
   * Pause queue processing
   */
  async pauseQueue(): Promise<void> {
    await this.emailQueue.pause();
    this.logger.log('Queue paused');
  }

  /**
   * Resume queue processing
   */
  async resumeQueue(): Promise<void> {
    await this.emailQueue.resume();
    this.logger.log('Queue resumed');
  }
}
