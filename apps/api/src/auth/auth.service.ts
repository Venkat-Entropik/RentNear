// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/auth.service.ts
//
// Core auth business logic:
//  1. sendOtp()   — Generate, hash, and store OTP; mock SMS dispatch.
//  2. verifyOtp() — Validate OTP, upsert User, issue JWT tokens.
// ──────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { SendOtpResponse, AuthTokenResponse, JwtPayload, UserPublic } from '@rentnear/types';
import { Role, KycStatus } from '@rentnear/types';

// Number of bcrypt rounds for OTP hashing (lower than password hashing
// for speed — OTPs are short-lived and already rate-limited)
const OTP_BCRYPT_ROUNDS = 8;

// Max OTP attempts per phone within the OTP TTL window
const MAX_OTP_ATTEMPTS_PER_WINDOW = 3;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // SEND OTP
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Generates a 6-digit OTP, stores its bcrypt hash in OtpSession,
   * and dispatches it via SMS (mocked to console in development).
   *
   * Rate-limiting: rejects if >3 pending sessions exist for the phone
   * within the TTL window to prevent SMS flooding.
   */
  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponse> {
    const { phone } = dto;
    const ttlSeconds = this.config.get<number>('OTP_TTL_SECONDS', 300);

    // ── Rate-limit check ─────────────────────────────────────────────────────
    const recentAttempts = await this.prisma.otpSession.count({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (recentAttempts >= MAX_OTP_ATTEMPTS_PER_WINDOW) {
      throw new HttpException(
        'Too many OTP requests. Please wait before requesting another.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ── Generate OTP ──────────────────────────────────────────────────────────
    const otp = this.generateNumericOtp(6);
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // ── Persist OTP session ───────────────────────────────────────────────────
    await this.prisma.otpSession.create({
      data: {
        phone,
        otpHash,
        expiresAt,
      },
    });

    // ── Dispatch SMS (MOCKED for development) ─────────────────────────────────
    // TODO: Replace with your SMS gateway (MSG91 / Twilio / 2Factor.in)
    // Example MSG91 integration:
    //   await this.smsService.send({ to: phone, body: `Your RentNear OTP is ${otp}` });
    this.logger.warn(
      `[SMS MOCK] OTP for ${phone}: ${otp} (expires in ${ttlSeconds}s) — Replace with real SMS provider in production`,
    );

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresInSeconds: ttlSeconds,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VERIFY OTP
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Validates the OTP, creates or retrieves the User record,
   * and returns a JWT access token + refresh token pair.
   *
   * Security notes:
   * - OTP session is marked `verified=true` immediately upon first use.
   * - Expired sessions are rejected even if the hash matches.
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokenResponse> {
    const { phone, otp } = dto;

    // ── Find the latest valid (unverified, unexpired) OTP session ─────────────
    const session = await this.prisma.otpSession.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      throw new BadRequestException('No valid OTP session found. Please request a new OTP.');
    }

    // ── Verify the OTP hash ───────────────────────────────────────────────────
    const isValid = await bcrypt.compare(otp, session.otpHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP. Please try again.');
    }

    // ── Atomically mark OTP as used (prevents replay attacks) ─────────────────
    await this.prisma.otpSession.update({
      where: { id: session.id },
      data: { verified: true },
    });

    // ── Upsert User (create on first login, retrieve on subsequent logins) ────
    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone },
      update: { updatedAt: new Date() },
    });

    // ── Link session to user (for audit trail) ────────────────────────────────
    await this.prisma.otpSession.update({
      where: { id: session.id },
      data: { userId: user.id },
    });

    // ── Issue JWT tokens ──────────────────────────────────────────────────────
    const { accessToken, refreshToken } = await this.issueTokenPair(user.id, user.phone, user.role);

    // ── Map Prisma user to public shape ───────────────────────────────────────
    const userPublic: UserPublic = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role as Role,
      kycStatus: user.kycStatus as KycStatus,
      createdAt: user.createdAt.toISOString(),
    };

    return { accessToken, refreshToken, user: userPublic };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Generates a cryptographically safe numeric OTP string.
   * Uses crypto.getRandomValues equivalent via Math.random for simplicity;
   * production should use Node's crypto.randomInt().
   */
  private generateNumericOtp(length: number): string {
    // crypto.randomInt is available in Node >= 14.10.0
    const { randomInt } = require('crypto') as typeof import('crypto');
    return Array.from({ length }, () => randomInt(0, 10)).join('');
  }

  /**
   * Issues an access token (short TTL) and a refresh token (long TTL).
   * Refresh token is hashed with SHA-256 before storage.
   */
  private async issueTokenPair(
    userId: string,
    phone: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: userId, phone, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    // Generate a random refresh token (UUID-like opaque string)
    const { randomBytes } = require('crypto') as typeof import('crypto');
    const rawRefreshToken = randomBytes(64).toString('hex');

    // Hash before storage — only the raw token is sent to the client
    const { createHash } = require('crypto') as typeof import('crypto');
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshExpiresAt = new Date(Date.now() + this.parseDurationMs(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  /**
   * Parses duration strings like "15m", "7d", "1h" into milliseconds.
   */
  private parseDurationMs(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return (units[unit] ?? 1000) * value;
  }
}
