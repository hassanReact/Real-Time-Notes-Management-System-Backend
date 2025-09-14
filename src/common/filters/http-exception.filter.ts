// Global HTTP Exception Filter
// Provides consistent error response format across the application

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Get HTTP context from arguments host
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Extract status code from exception
    const status = exception.getStatus();
    
    // Get exception response (can be string or object)
    const exceptionResponse = exception.getResponse();
    
    // Determine error message and details
    let message: string;
    let errors: any = null;
    
    if (typeof exceptionResponse === 'string') {
      // Simple string message
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      // Object response with message and possible validation errors
      const responseObj = exceptionResponse as any;
      message = responseObj.message || 'An error occurred';
      errors = responseObj.errors || responseObj.message;
    } else {
      // Fallback message
      message = 'Internal server error';
    }

    // Create standardized error response
    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }), // Include errors if present
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error for debugging (exclude 4xx client errors from detailed logging)
    if (status >= 500) {
      console.error('Server Error:', {
        ...errorResponse,
        stack: exception.stack,
      });
    } else if (status >= 400 && status < 500) {
      console.warn('Client Error:', errorResponse);
    }

    // Send formatted error response
    response.status(status).json(errorResponse);
  }
}