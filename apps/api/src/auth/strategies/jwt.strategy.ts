// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/strategies/jwt.strategy.ts
//
// Passport JWT strategy — extracts Bearer token from Authorization header,
// verifies signature with JWT_SECRET, and injects the payload into the request.
// ──────────────────────────────────────────────────────────────────────────────

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '@rentnear/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Extract JWT from "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject tokens where exp < now()
      ignoreExpiration: false,
      // Secret must match the one used to sign tokens in AuthService
      secretOrKey: config.get<string>('JWT_SECRET', 'INSECURE_DEFAULT_CHANGE_ME'),
    });
  }

  /**
   * Called after the JWT signature is verified.
   * Validates that the user still exists in the database.
   * Return value is attached to `request.user`.
   *
   * @throws UnauthorizedException if user no longer exists.
   */
    async validate(payload: JwtPayload) {
    // Verify user still exists — reject if deleted
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or token has been revoked.');
    }

    return payload; // Contains { sub, phone, role } — what controllers expect
  }
}
