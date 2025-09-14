// Email Service - Email bhejne ke saare functions yahan hain
// Welcome emails, password reset, notifications waghaira

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Email Service - Email operations handle karta hai
 * Welcome emails, password reset, notifications bhejta hai
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService, // Email bhejne ke liye
    private configService: ConfigService, // Environment variables ke liye
  ) {}

  /**
   * Welcome email bhejne ke liye - Naye user ko
   * Registration ke baad automatically bhejta hai
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email, // Recipient email
        subject: 'Notes Management mein Welcome! 🎉', // Email subject
        template: 'welcome', // Template name (welcome.hbs)
        context: {
          // Template variables
          name: name,
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          appUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@notesapp.com'),
        },
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Email fail hone pe app crash nahi karna chahiye
    }
  }

  /**
   * Password reset email bhejne ke liye
   * Forgot password request pe bhejta hai
   */
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request - Notes Management 🔐',
        template: process.cwd() + '/src/templates/emails/password-reset.hbs',
        context: {
          name: name,
          resetUrl: resetUrl,
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@notesapp.com'),
          // Token 1 hour mein expire hota hai
          expiryTime: '1 hour',
        },
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
    }
  }

  /**
   * Email verification email bhejne ke liye
   * Account verification ke liye
   */
  async sendEmailVerification(email: string, name: string, verificationToken: string): Promise<void> {
    try {
      const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Email Verification - Notes Management ✅',
        template: 'email-verification',
        context: {
          name: name,
          verificationUrl: verificationUrl,
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@notesapp.com'),
        },
      });

      this.logger.log(`Email verification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${email}:`, error);
    }
  }

  /**
   * Note shared notification email
   * Jab koi note share kare to notification bhejta hai
   */
  async sendNoteSharedEmail(
    recipientEmail: string,
    recipientName: string,
    sharedByName: string,
    noteTitle: string,
    noteId: string
  ): Promise<void> {
    try {
      const noteUrl = `${this.configService.get<string>('FRONTEND_URL')}/notes/${noteId}`;

      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: `${sharedByName} ne aapke saath note share kiya! 📝`,
        template: 'note-shared',
        context: {
          recipientName: recipientName,
          sharedByName: sharedByName,
          noteTitle: noteTitle,
          noteUrl: noteUrl,
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          appUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Note shared email sent to ${recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send note shared email to ${recipientEmail}:`, error);
    }
  }

  /**
   * System notification email
   * Important system updates ke liye
   */
  async sendSystemNotification(
    email: string,
    name: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `${subject} - Notes Management 📢`,
        template: 'system-notification',
        context: {
          name: name,
          subject: subject,
          message: message,
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          appUrl: this.configService.get<string>('FRONTEND_URL'),
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@notesapp.com'),
        },
      });

      this.logger.log(`System notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send system notification to ${email}:`, error);
    }
  }

  /**
   * Test email bhejne ke liye - Development mein testing ke liye
   */
  async sendTestEmail(email: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Test Email - Notes Management 🧪',
        template: 'test-email',
        context: {
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Test email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send test email to ${email}:`, error);
      throw error; // Test email mein error throw karte hain debugging ke liye
    }
  }

  /**
   * Notification email bhejne ke liye
   * Jab koi note share hota hai ya update hota hai
   */
  async sendNotificationEmail(
    email: string,
    name: string,
    notificationData: {
      type: 'note_shared' | 'note_updated' | 'note_deleted' | 'system';
      title: string;
      message: string;
      noteTitle?: string;
      noteId?: string;
      sharedBy?: string;
    },
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `${notificationData.title} - Notes Management 🔔`,
        template: 'notification',
        context: {
          name: name,
          notificationType: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          noteTitle: notificationData.noteTitle,
          noteId: notificationData.noteId,
          sharedBy: notificationData.sharedBy,
          appName: this.configService.get<string>('APP_NAME', 'Notes Management'),
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@notesapp.com'),
          timestamp: new Date().toLocaleString(),
        },
      });

      this.logger.log(`Notification email sent to ${email}: ${notificationData.type}`);
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${email}:`, error);
      // Notification email fail hone pe app crash nahi karna chahiye
    }
  }

  /**
   * Bulk notification email bhejne ke liye
   * Multiple users ko same notification bhejne ke liye
   */
  async sendBulkNotificationEmail(
    recipients: Array<{ email: string; name: string }>,
    notificationData: {
      type: 'note_shared' | 'note_updated' | 'note_deleted' | 'system';
      title: string;
      message: string;
      noteTitle?: string;
      noteId?: string;
      sharedBy?: string;
    },
  ): Promise<void> {
    const emailPromises = recipients.map(recipient =>
      this.sendNotificationEmail(recipient.email, recipient.name, notificationData),
    );

    await Promise.allSettled(emailPromises);
    this.logger.log(`Bulk notification sent to ${recipients.length} recipients`);
  }
}