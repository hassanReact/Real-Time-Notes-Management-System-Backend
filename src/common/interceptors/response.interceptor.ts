// Response Interceptor
// Standardizes successful API responses across the application

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface for standardized API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Response Interceptor
 * Wraps all successful responses in a consistent format
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    // Get HTTP context for request information
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: this.getSuccessMessage(request.method),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      })),
    );
  }

  /**
   * Generate appropriate success message based on HTTP method
   */
  private getSuccessMessage(method: string): string {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'Resource created successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      case 'GET':
      default:
        return 'Request completed successfully';
    }
  }
}