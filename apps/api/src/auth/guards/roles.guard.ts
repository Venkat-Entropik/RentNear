import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '@rentnear/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) return false;

    // Assume user.role is added to JwtPayload. If not, we might need to fetch the user or ensure it's in the payload.
    // For now, let's assume `role` is stored in the JWT or we just query the DB. 
    // Actually, in schema.prisma, we added `Role` enum. We should include `role` in JwtPayload.
    return requiredRoles.includes(user.role as Role);
  }
}
