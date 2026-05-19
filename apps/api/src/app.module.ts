// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/app.module.ts
//
// Root NestJS module. Imports:
//  - ConfigModule  (global, loads .env)
//  - ThrottlerModule (global HTTP rate limiting)
//  - PrismaModule  (global DB access)
//  - AuthModule    (auth feature)
// ──────────────────────────────────────────────────────────────────────────────

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { DisputesModule } from './disputes/disputes.module';

@Module({
  imports: [
    // ── Configuration ──────────────────────────────────────────────────────
    // Loads .env into process.env; isGlobal makes ConfigService available
    // everywhere without re-importing ConfigModule.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate Limiting ──────────────────────────────────────────────────────
    // Global throttler: 20 requests per 60-second window per IP.
    // Auth controller adds additional application-level rate limiting.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 seconds in ms
        limit: 20,
      },
    ]),

    // ── Database ───────────────────────────────────────────────────────────
    PrismaModule,

    // ── Feature Modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ListingsModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    ChatModule,
    AdminModule,
    DisputesModule,
  ],
})
export class AppModule {}
