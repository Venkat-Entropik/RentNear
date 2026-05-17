// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/auth.module.ts
//
// Assembles the Auth feature:
// - Registers JwtModule with async config (reads secrets from ConfigService)
// - Registers PassportModule
// - Provides AuthService, JwtStrategy, JwtAuthGuard
// - Exports JwtAuthGuard so other modules can use it
// ──────────────────────────────────────────────────────────────────────────────

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    // ConfigModule is already global (registered in AppModule)
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule with async config reads secret from environment at runtime
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'INSECURE_DEFAULT_CHANGE_ME'),
        // Default expiry — individual calls can override via sign() options
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
