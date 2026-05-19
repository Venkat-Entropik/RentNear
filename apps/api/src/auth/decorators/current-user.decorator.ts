// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/decorators/current-user.decorator.ts
//
// Parameter decorator that extracts the authenticated user's JWT payload
// from the request object (set by Passport JwtStrategy.validate()).
// ──────────────────────────────────────────────────────────────────────────────

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '@rentnear/types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return request.user;
  },
);
