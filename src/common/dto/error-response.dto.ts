// Error Response DTOs
// Defines standardized error response structures

import { ApiProperty } from '@nestjs/swagger';

/**
 * Base Error Response DTO
 * Standard error response structure
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Request success status',
    example: false
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed'
  })
  message: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2023-12-01T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/auth/register'
  })
  path: string;

  @ApiProperty({
    description: 'HTTP method',
    example: 'POST'
  })
  method: string;
}

/**
 * Validation Error Response DTO
 * Error response with validation details
 */
export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Validation errors by field',
    example: {
      email: 'Please provide a valid email address',
      password: 'Password must be at least 8 characters long',
      name: 'Name is required'
    }
  })
  errors: Record<string, string>;
}

/**
 * Unauthorized Error Response DTO
 * 401 Unauthorized error response
 */
export class UnauthorizedErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401
  })
  statusCode: 401;

  @ApiProperty({
    description: 'Error message',
    example: 'Authentication required'
  })
  message: string;
}

/**
 * Forbidden Error Response DTO
 * 403 Forbidden error response
 */
export class ForbiddenErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 403
  })
  statusCode: 403;

  @ApiProperty({
    description: 'Error message',
    example: 'Insufficient permissions'
  })
  message: string;
}

/**
 * Not Found Error Response DTO
 * 404 Not Found error response
 */
export class NotFoundErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404
  })
  statusCode: 404;

  @ApiProperty({
    description: 'Error message',
    example: 'Resource not found'
  })
  message: string;
}

/**
 * Rate Limit Error Response DTO
 * 429 Too Many Requests error response
 */
export class RateLimitErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 429
  })
  statusCode: 429;

  @ApiProperty({
    description: 'Error message',
    example: 'Too many requests. Rate limit exceeded.'
  })
  message: string;
}

/**
 * Internal Server Error Response DTO
 * 500 Internal Server Error response
 */
export class InternalServerErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 500
  })
  statusCode: 500;

  @ApiProperty({
    description: 'Error message',
    example: 'Internal server error'
  })
  message: string;
}