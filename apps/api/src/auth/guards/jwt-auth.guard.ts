// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/guards/jwt-auth.guard.ts
//
// Thin guard wrapper around Passport's 'jwt' strategy.
// Apply this to any controller/route that requires authentication:
//   @UseGuards(JwtAuthGuard)
// ──────────────────────────────────────────────────────────────────────────────

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Delegate to Passport JWT strategy
    return super.canActivate(context);
  }
}
