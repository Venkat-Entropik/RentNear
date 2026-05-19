import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      // Tokens can be passed in handshake auth or headers
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const secret = process.env['JWT_SECRET'];
      if (!secret) throw new Error('JWT_SECRET is not defined');

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Attach user payload to the socket client
      client.user = payload;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromSocket(client: any): string | null {
    // 1. Check handshake auth
    if (client.handshake?.auth?.token) {
      return client.handshake.auth.token;
    }
    // 2. Check headers
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return null;
  }
}
