// Email Module - Email functionality ke liye module
// Nodemailer, templates, aur email service yahan configure karte hain

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailConfigService } from '../config/email.config';

/**
 * Email Module - Email features ke liye
 * Welcome emails, password reset, notifications waghaira
 */
@Module({
  imports: [
    // Mailer module configure kar rahe hain
    MailerModule.forRootAsync({
      useClass: EmailConfigService, // Email configuration service
    }),
  ],
  providers: [
    EmailService, // Email operations service
    EmailConfigService, // Email configuration
  ],
  exports: [
    EmailService, // Dusre modules mein use karne ke liye
  ],
})
export class EmailModule {}