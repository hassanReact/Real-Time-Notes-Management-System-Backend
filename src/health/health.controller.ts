// Health Check Controller
// Provides system health monitoring endpoints

import { Controller, Get } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiExcludeEndpoint 
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { 
  HealthCheckResponseDto, 
  DetailedHealthCheckResponseDto 
} from '../common/dto/api-response.dto';

/**
 * Health Check Controller
 * Monitors system health and dependencies
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Basic health check endpoint
   * GET /health
   */
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Returns basic application health status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    type: HealthCheckResponseDto
  })
  @Public()
  @Get()
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * Detailed health check with dependencies
   * GET /health/detailed
   */
  @ApiOperation({ 
    summary: 'Detailed health check',
    description: 'Returns detailed health status including database and Redis connectivity'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health information',
    type: DetailedHealthCheckResponseDto
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Service unavailable - one or more dependencies are unhealthy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 503 },
        message: { type: 'string', example: 'Service unavailable' }
      }
    }
  })
  @Public()
  @Get('detailed')
  async detailedHealthCheck() {
    // Check database health
    const databaseHealthy = await this.prisma.isHealthy();
    
    // Check Redis health
    const redisHealthy = await this.redisService.isHealthy();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100;

    return {
      status: databaseHealthy && redisHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      dependencies: {
        database: {
          status: databaseHealthy ? 'connected' : 'disconnected',
          healthy: databaseHealthy,
        },
        redis: {
          status: redisHealthy ? 'connected' : 'disconnected',
          healthy: redisHealthy,
        },
      },
      memory: {
        used: memoryUsedMB,
        total: memoryTotalMB,
        unit: 'MB',
      },
    };
  }

  /**
   * Readiness probe for Kubernetes
   * GET /health/ready
   */
  @ApiExcludeEndpoint() // Hide from Swagger docs
  @Public()
  @Get('ready')
  async readinessProbe() {
    const databaseHealthy = await this.prisma.isHealthy();
    
    if (!databaseHealthy) {
      throw new Error('Database not ready');
    }

    return { status: 'ready' };
  }

  /**
   * Liveness probe for Kubernetes
   * GET /health/live
   */
  @ApiExcludeEndpoint() // Hide from Swagger docs
  @Public()
  @Get('live')
  async livenessProbe() {
    return { status: 'alive' };
  }
}