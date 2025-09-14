// Email Configuration - Email service setup karne ke liye
// Nodemailer aur SMTP settings yahan configure karte hain

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

/**
 * Email Configuration Service - Email settings configure karta hai
 * SMTP server, templates, aur email options yahan set karte hain
 */
@Injectable()
export class EmailConfigService implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}

  /**
   * Mailer options create karta hai
   * SMTP settings aur email templates configure karta hai
   */
  createMailerOptions(): MailerOptions {
    return {
      // SMTP Transport configuration
      transport: {
        host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'), // SMTP server
        port: this.configService.get<number>('EMAIL_PORT', 587), // SMTP port
        secure: false, // TLS use karta hai (587 port ke liye false)
        auth: {
          user: this.configService.get<string>('EMAIL_USER'), // Email address
          pass: this.configService.get<string>('EMAIL_PASSWORD'), // Email password ya app password
        },
        tls: {
          rejectUnauthorized: false, // Self-signed certificates allow karta hai
        },
      },

      // Default email settings
      defaults: {
        from: `"${this.configService.get<string>('APP_NAME', 'Notes Management')}" <${this.configService.get<string>('SMTP_FROM', 'noreply@notesapp.com')}>`,
      },

      // Email templates configuration
      template: {
        dir: process.cwd() + '/src/templates/emails', // Templates folder path (use source directory)
        adapter: new HandlebarsAdapter(), // Handlebars template engine
        options: {
          strict: true, // Strict mode enable
        },
      },

      // Email options
      options: {
        partials: {
          dir: join(__dirname, '..', 'templates', 'emails', 'partials'), // Partial templates
          options: {
            strict: true,
          },
        },
      },
    };
  }
}