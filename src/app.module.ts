// Main Application Module - Ye puri app ka center hai
// Yahan saare modules aur global providers configure karte hain

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { FilesModule } from './files/files.module';
import { QueueModule } from './queue/queue.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DatabaseModule } from './config/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RedisService } from './config/redis.config';

/**
 * Main Application Module - Ye puri app ko control karta hai
 * Saare modules, database, security waghaira yahan setup hote hain
 */
@Module({
  imports: [
    // Environment variables ke liye configuration module
    ConfigModule.forRoot({
      isGlobal: true,           // Puri app mein config available kar deta hai
      envFilePath: '.env',      // .env file se settings read karta hai
      cache: true,              // Performance ke liye cache kar deta hai
    }),

    // Rate limiting module - API abuse se bachne ke liye
    ThrottlerModule.forRoot([
      {
        name: 'short',          // Short-term limit - jaldi jaldi requests block karta hai
        ttl: 1000,              // 1 second ka window
        limit: 3,               // 1 second mein sirf 3 requests allow
      },
      {
        name: 'medium',         // Medium-term limit
        ttl: 10000,             // 10 seconds ka window
        limit: 20,              // 10 seconds mein 20 requests allow
      },
      {
        name: 'long',           // Long-term limit
        ttl: 60000,             // 1 minute ka window
        limit: 100,             // 1 minute mein 100 requests allow
      },
    ]),

    // Database module - PostgreSQL aur Prisma setup
    DatabaseModule,             // Global database configuration

    // Feature modules - App ke main features
    AuthModule,                 // Login/Register aur security
    UsersModule,                // Users ka management (profile, search waghaira)
    NotesModule,                // Notes create/edit/delete karne ke liye
    NotificationsModule,        // Real-time notifications system
    WebSocketModule,            // Live updates ke liye WebSocket
    AdminModule,                // Admin panel aur management features
    EmailModule,                // Email service (welcome, reset, notifications)
    FilesModule,                // File upload and storage functionality
    QueueModule,                // Background job processing
    AnalyticsModule,            // User behavior tracking and analytics
    HealthModule,               // App ki health check karne ke liye
  ],

  controllers: [
    // Global controllers (none at root level)
  ],

  providers: [
    // Global Redis service - caching ke liye
    RedisService,

    // Global guards - saare routes pe apply hote hain
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,   // JWT token check karta hai har request pe
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,     // User ke role check karta hai (USER/ADMIN)
    },
  ],

  exports: [
    // Dusre modules mein use karne ke liye export kar rahe hain
    RedisService,
  ],
})
export class AppModule {
  constructor() {
    // App start hone pe message print karta hai
    console.log('✅ Application module initialized - App ready hai!');
  }
}