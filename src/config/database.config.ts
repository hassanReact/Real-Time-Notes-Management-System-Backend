// Database configuration module
// Handles Prisma client setup and database connection management

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Database service that manages Prisma client lifecycle
 * Implements NestJS module lifecycle hooks for proper connection management
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  /**
   * Initialize database connection when module starts
   * Called automatically by NestJS during application bootstrap
   */
  async onModuleInit() {
    try {
      // Connect to the database
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      // Log connection errors for debugging
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Clean up database connection when module shuts down
   * Called automatically by NestJS during application shutdown
   */
  async onModuleDestroy() {
    try {
      // Disconnect from the database
      await this.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      // Log disconnection errors
      console.error('❌ Database disconnection failed:', error);
    }
  }

  /**
   * Health check method to verify database connectivity
   * Can be used by health check endpoints
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Simple query to test database connectivity
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      // Return false if database is not accessible
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Execute database operations within a transaction
   * Ensures data consistency for complex operations
   */
  async executeTransaction<T>(
    operations: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      // Execute the provided operations within transaction context
      return await operations(prisma);
    });
  }
}