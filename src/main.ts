// Application entry point - Yahan se puri app start hoti hai
// Security aur performance optimizations ke saath NestJS app configure karta hai

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger.config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

/**
 * Bootstrap function - App ko initialize aur start karne ke liye
 * Saari settings aur configurations yahan hoti hain
 */
async function bootstrap() {
  // NestJS application instance create kar rahe hain
  const app = await NestFactory.create(AppModule);

  // Environment variables ke liye configuration service get kar rahe hain
  const configService = app.get(ConfigService);

  // Security middleware - HTTP headers set karta hai security ke liye
  app.use(helmet());

  // Compression middleware - response bodies ko compress karta hai speed ke liye
  app.use(compression());

  // CORS enable kar rahe hain - frontend se API call karne ke liye
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Cookies aur authorization headers allow karta hai
  });

  // Saare routes ke liye global prefix - saare URLs "api/v1" se start honge
  app.setGlobalPrefix('api/v1');

  // Global validation pipe - saari incoming requests validate karta hai
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Unknown properties remove kar deta hai
      forbidNonWhitelisted: true, // Unknown properties pe error throw karta hai
      transform: true,           // Data ko DTO instances mein convert karta hai
      disableErrorMessages: false, // Error messages debugging ke liye rakhta hai
    }),
  );

  // Global exception filter - saare errors ko consistent format mein return karta hai
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor - saare success responses ko consistent format mein return karta hai
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger API Documentation setup - API docs banane ke liye
  const config = SwaggerConfig.createDocumentConfig();
  const documentOptions = SwaggerConfig.getDocumentOptions();
  const swaggerUIOptions = SwaggerConfig.getSwaggerUIOptions();

  const document = SwaggerModule.createDocument(app, config, documentOptions);
  SwaggerModule.setup('api/docs', app, document, swaggerUIOptions);

  // Port number get kar rahe hain environment se ya default 3000
  const port = configService.get<number>('PORT') || 7200;

  // Application start kar rahe hain
  await app.listen(port);

  // Startup information print kar rahe hain
  console.log(`🚀 Application chal rahi hai: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
  console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`);
}

// Application start kar rahe hain aur startup errors handle kar rahe hain
bootstrap().catch((error) => {
  console.error('❌ Application start nahi hui:', error);
  process.exit(1);
});