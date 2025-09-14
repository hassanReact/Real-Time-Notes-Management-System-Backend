// Redis configuration module
// Handles Redis client setup for caching and session management

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * Redis service for caching and session management
 * Implements module lifecycle hooks for proper connection management
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    // Initialize Redis client with configuration from environment
    this.client = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST') || 'localhost',
        port: this.configService.get<number>('REDIS_PORT') || 6379,
      },
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    });

    // Set up error handling for Redis client
    this.client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    // Log successful Redis connection
    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  /**
   * Initialize Redis connection when module starts
   */
  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      // Don't throw error to allow app to start without Redis
      // Redis features will be disabled gracefully
    }
  }

  /**
   * Clean up Redis connection when module shuts down
   */
  async onModuleDestroy() {
    try {
      await this.client.disconnect();
      console.log('✅ Redis disconnected successfully');
    } catch (error) {
      console.error('❌ Redis disconnection failed:', error);
    }
  }

  /**
   * Get Redis client instance
   * Returns the Redis client for direct operations
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * Set a key-value pair with optional expiration
   * @param key - The key to set
   * @param value - The value to store
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        // Set with expiration time
        await this.client.setEx(key, ttl, value);
      } else {
        // Set without expiration
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      // Fail silently to not break application flow
    }
  }

  /**
   * Get value by key
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      const result = await this.client.get(key);
      // Redis client returns string | null, but TypeScript sees it as string | {}
      // We need to handle the case where result might be an empty object
      if (result === null || result === undefined || typeof result !== 'string') {
        return null;
      }
      return result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Delete a key
   * @param key - The key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  /**
   * Check if Redis is connected and healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Ping Redis to check connectivity
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Cache user session data
   * @param userId - User ID
   * @param sessionData - Session data to cache
   * @param ttl - Time to live in seconds
   */
  async cacheUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    const key = `user_session:${userId}`;
    await this.set(key, JSON.stringify(sessionData), ttl);
  }

  /**
   * Get cached user session data
   * @param userId - User ID
   * @returns Parsed session data or null
   */
  async getUserSession(userId: string): Promise<any | null> {
    const key = `user_session:${userId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear user session cache
   * @param userId - User ID
   */
  async clearUserSession(userId: string): Promise<void> {
    const key = `user_session:${userId}`;
    await this.del(key);
  }
}