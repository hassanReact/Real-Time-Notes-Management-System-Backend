// Swagger configuration module
// Centralizes API documentation setup and configuration

import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

/**
 * Swagger configuration for API documentation
 * Provides comprehensive API documentation with examples and schemas
 */
export class SwaggerConfig {
  /**
   * Create Swagger document configuration
   * Defines API metadata, security, and server information
   */
  static createDocumentConfig() {
    return new DocumentBuilder()
      .setTitle('Notes Management System API')
      .setDescription(`
        A comprehensive backend API for managing notes with advanced features:
        
        ## Features
        - 🔐 JWT Authentication with refresh tokens
        - 👥 Role-based access control (Admin, User)
        - 📝 Full CRUD operations for notes
        - 🔄 Version control system for notes
        - 🔔 Real-time notifications
        - 🏷️ Tag-based categorization
        - 👁️ Visibility controls (Private, Public, Shared)
        - 📤 Note sharing with permissions
        - 🗄️ Archive/unarchive functionality
        
        ## Authentication
        Most endpoints require authentication. Use the /auth/login endpoint to get your JWT token,
        then click the "Authorize" button above and enter: Bearer YOUR_JWT_TOKEN
        
        ## Rate Limiting
        All endpoints are rate-limited to prevent abuse:
        - 3 requests per second
        - 20 requests per 10 seconds  
        - 100 requests per minute
      `)
      .setVersion('1.0.0')
      .setContact(
        'API Support',
        'https://github.com/your-repo/notes-management-backend',
        'support@notesapp.com'
      )
      .setLicense(
        'MIT License',
        'https://opensource.org/licenses/MIT'
      )
      
      // API Tags for grouping endpoints
      .addTag('Authentication', 'User authentication and authorization endpoints')
      .addTag('Users', 'User profile management and settings')
      .addTag('Notes', 'Notes CRUD operations and management')
      .addTag('Versions', 'Note version control and history')
      .addTag('Sharing', 'Note sharing and collaboration features')
      .addTag('Notifications', 'Real-time notification system')
      .addTag('Health', 'System health and monitoring endpoints')
      
      // JWT Bearer Authentication
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token (without Bearer prefix)',
          in: 'header',
        },
        'JWT-auth'
      )
      
      // API Key Authentication (for admin endpoints)
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API key for admin operations'
        },
        'API-Key'
      )
      
      // Server configurations
      .addServer('http://localhost:3000', 'Development Server')
      .addServer('https://api-staging.notesapp.com', 'Staging Server')
      .addServer('https://api.notesapp.com', 'Production Server')
      
      .build();
  }

  /**
   * Swagger document options
   * Additional configuration for document generation
   */
  static getDocumentOptions(): SwaggerDocumentOptions {
    return {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
      ignoreGlobalPrefix: false,
    };
  }

  /**
   * Swagger UI setup options
   * Customizes the Swagger UI appearance and behavior
   */
  static getSwaggerUIOptions() {
    return {
      swaggerOptions: {
        persistAuthorization: true,    // Keep auth when page refreshes
        displayRequestDuration: true,  // Show request timing
        filter: true,                  // Enable endpoint filtering
        showExtensions: true,          // Show vendor extensions
        showCommonExtensions: true,    // Show common extensions
        tagsSorter: 'alpha',          // Sort tags alphabetically
        operationsSorter: 'alpha',    // Sort operations alphabetically
        docExpansion: 'list',         // Default expansion level
        defaultModelsExpandDepth: 2,   // Model expansion depth
        defaultModelExpandDepth: 2,    // Individual model depth
        displayOperationId: false,     // Hide operation IDs
        tryItOutEnabled: true,         // Enable try-it-out by default
      },
      customSiteTitle: 'Notes Management API Documentation',
      customfavIcon: '/favicon.ico',
      customCssUrl: '/swagger-custom.css',
      customJs: '/swagger-custom.js',
      customCss: `
        /* Custom Swagger UI Styling */
        .swagger-ui .topbar { 
          display: none; 
        }
        
        .swagger-ui .info .title { 
          color: #3b82f6; 
          font-size: 2.5rem;
          font-weight: bold;
        }
        
        .swagger-ui .info .description { 
          font-size: 1.1rem;
          line-height: 1.6;
        }
        
        .swagger-ui .scheme-container { 
          background: #f8fafc; 
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }
        
        .swagger-ui .opblock.opblock-post { 
          border-color: #10b981; 
          background: rgba(16, 185, 129, 0.1);
        }
        
        .swagger-ui .opblock.opblock-get { 
          border-color: #3b82f6; 
          background: rgba(59, 130, 246, 0.1);
        }
        
        .swagger-ui .opblock.opblock-put { 
          border-color: #f59e0b; 
          background: rgba(245, 158, 11, 0.1);
        }
        
        .swagger-ui .opblock.opblock-delete { 
          border-color: #ef4444; 
          background: rgba(239, 68, 68, 0.1);
        }
        
        .swagger-ui .btn.authorize { 
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .swagger-ui .btn.authorize:hover { 
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .swagger-ui .response-col_status {
          font-weight: bold;
        }
        
        .swagger-ui .response.highlighted {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
        }
      `,
    };
  }

  /**
   * Generate example responses for common HTTP status codes
   */
  static getCommonResponses() {
    return {
      400: {
        description: 'Bad Request - Invalid input data',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number', example: 400 },
            message: { type: 'string', example: 'Validation failed' },
            errors: { 
              type: 'object',
              example: {
                email: 'Please provide a valid email address',
                password: 'Password must be at least 8 characters long'
              }
            },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/v1/auth/register' }
          }
        }
      },
      401: {
        description: 'Unauthorized - Authentication required',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number', example: 401 },
            message: { type: 'string', example: 'Authentication required' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/v1/notes' }
          }
        }
      },
      403: {
        description: 'Forbidden - Insufficient permissions',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number', example: 403 },
            message: { type: 'string', example: 'Insufficient permissions' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/v1/admin/users' }
          }
        }
      },
      404: {
        description: 'Not Found - Resource not found',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number', example: 404 },
            message: { type: 'string', example: 'Resource not found' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/v1/notes/invalid-id' }
          }
        }
      },
      429: {
        description: 'Too Many Requests - Rate limit exceeded',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number', example: 429 },
            message: { type: 'string', example: 'Too many requests. Rate limit exceeded.' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/v1/auth/login' }
          }
        }
      },
      500: {
        description: 'Internal Server Error',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number', example: 500 },
            message: { type: 'string', example: 'Internal server error' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/v1/notes' }
          }
        }
      }
    };
  }
}