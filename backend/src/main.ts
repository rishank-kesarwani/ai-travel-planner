import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = Number(process.env.PORT) || configService.get<number>('port', 4000);

  // Origins for CORS
  const rawFrontendUrl =
    configService.get<string>('frontendUrl') ||
    process.env.FRONTEND_URL ||
    'https://travel-planner.rishankkesarwani.com';

  const configuredOrigins = rawFrontendUrl
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'https://travel-planner.rishankkesarwani.com',
    'https://travel.rishankkesarwani.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const allowedOrigins = Array.from(
    new Set([...configuredOrigins, ...defaultOrigins]),
  );

  // Security & Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // For Swagger UI
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-service-api-key',
      'x-application-id',
      'x-tenant-id',
      'x-user-id',
    ],
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Travel Planner API')
    .setDescription(
      'Production-grade REST and AI Agent Tool API for AI Travel Planner. Seamlessly integrated with ai-platform.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-service-api-key', in: 'header' }, 'x-service-api-key')
    .addTag('Auth', 'User Authentication & JWT Tokens')
    .addTag('Users', 'User Profiles & Personalization')
    .addTag('Trips', 'Trip Lifecycle & Itineraries')
    .addTag('Destinations', 'Curated Travel Destinations & Redis Caching')
    .addTag('AI Travel Platform', 'AI Workflows, RAG Ingestion, & Streaming Assistant')
    .addTag('Tools', 'Travel Domain Tools Executed by AI Platform')
    .addTag('Favorites', 'Saved Destination Bookmarks')
    .addTag('Reviews', 'Community Traveler Reviews')
    .addTag('Weather', 'Cached Destination Forecasts')
    .addTag('Health', 'Microservice Liveness & Readiness Checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AI Travel Planner API Docs',
  });

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Travel Planner Backend is running on port ${port} (0.0.0.0)`);
  logger.log(`📚 Swagger Documentation is available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
