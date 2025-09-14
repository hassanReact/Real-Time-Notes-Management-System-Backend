// API Response DTOs
// Defines standardized API response structures

import { ApiProperty } from '@nestjs/swagger';

/**
 * Generic API Response DTO
 * Standard success response wrapper
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Request success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response data'
  })
  data: T;

  @ApiProperty({
    description: 'Success message',
    example: 'Request completed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2023-12-01T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/auth/login'
  })
  path: string;

  @ApiProperty({
    description: 'HTTP method',
    example: 'POST'
  })
  method: string;
}

/**
 * Paginated Response DTO
 * Response structure for paginated data
 */
export class PaginatedResponseDto<T = any> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  hasPrev: boolean;
}

/**
 * Health Check Response DTO
 * Response structure for health check endpoints
 */
export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Health status',
    example: 'ok',
    enum: ['ok', 'degraded', 'down']
  })
  status: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2023-12-01T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 12345.67
  })
  uptime: number;

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0'
  })
  version: string;
}

/**
 * Detailed Health Check Response DTO
 * Extended health check with dependency status
 */
export class DetailedHealthCheckResponseDto extends HealthCheckResponseDto {
  @ApiProperty({
    description: 'Dependency health status',
    example: {
      database: {
        status: 'connected',
        healthy: true
      },
      redis: {
        status: 'connected',
        healthy: true
      }
    }
  })
  dependencies: {
    database: {
      status: string;
      healthy: boolean;
    };
    redis: {
      status: string;
      healthy: boolean;
    };
  };

  @ApiProperty({
    description: 'Memory usage information',
    example: {
      used: 45.2,
      total: 128.0,
      unit: 'MB'
    }
  })
  memory: {
    used: number;
    total: number;
    unit: string;
  };
}