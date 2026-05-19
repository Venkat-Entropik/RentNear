// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/main.ts
//
// NestJS application bootstrap with:
//  - Global ValidationPipe (class-validator)
//  - CORS configuration
//  - Global exception filter
//  - Graceful shutdown hooks
// ──────────────────────────────────────────────────────────────────────────────

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  // All routes become /api/v1/...
  app.setGlobalPrefix('api/v1');

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env['CORS_ORIGINS']?.split(',') ?? [
      'http://localhost:3000', // Next.js web dev
      'http://localhost:19006', // Expo web
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global Validation Pipe ────────────────────────────────────────────────
  // Automatically validates all @Body(), @Query(), @Param() using class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      // Strip unknown fields not in the DTO
      whitelist: true,
      // Reject requests with extra fields (prevents over-posting attacks)
      forbidNonWhitelisted: true,
      // Automatically transform primitives to their TS types
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Return all validation errors at once (not just the first one)
      stopAtFirstError: false,
    }),
  );

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  app.enableShutdownHooks();

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);

  logger.log(`🚀 RentNear API running on: http://localhost:${port}/api/v1`);
  logger.warn(`📱 OTP SMS is MOCKED — check console for OTP values in development`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
