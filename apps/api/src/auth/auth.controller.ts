// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/auth.controller.ts
//
// REST controller for the /auth resource.
// All heavy logic lives in AuthService — this layer only handles:
//  - Route definitions
//  - HTTP verbs and status codes
//  - Body extraction and DTO instantiation
//  - Response serialisation
// ──────────────────────────────────────────────────────────────────────────────

import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { SendOtpResponse, AuthTokenResponse } from '@rentnear/types';

/**
 * @route   /auth
 *
 * Public endpoints — no JWT guard on this controller.
 * ThrottlerGuard provides request-rate protection at the HTTP layer.
 */
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // POST /auth/send-otp
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Triggers OTP generation and SMS dispatch for the provided phone number.
   *
   * @param dto - Validated body: { phone: "+91XXXXXXXXXX" }
   * @returns   - { success, message, expiresInSeconds }
   *
   * HTTP 200 OK (not 201 — no resource is "created" from the client's perspective)
   * HTTP 400 — invalid phone format (handled by ValidationPipe)
   * HTTP 429 — too many requests (ThrottlerGuard or service-level rate limit)
   */
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto): Promise<SendOtpResponse> {
    return this.authService.sendOtp(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /auth/verify-otp
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Verifies the OTP and returns JWT tokens on success.
   *
   * @param dto - Validated body: { phone: "+91XXXXXXXXXX", otp: "123456" }
   * @returns   - { accessToken, refreshToken, user }
   *
   * HTTP 200 OK
   * HTTP 400 — no valid OTP session
   * HTTP 401 — wrong OTP
   * HTTP 422 — DTO validation failure (ValidationPipe)
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokenResponse> {
    return this.authService.verifyOtp(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /auth/refresh
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Exchanges a valid refresh token for a fresh access + refresh token pair.
   * Old refresh token is revoked immediately (rotation).
   *
   * @param dto - { refreshToken: string }
   * @returns   - { accessToken, refreshToken, user }
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokenResponse> {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
