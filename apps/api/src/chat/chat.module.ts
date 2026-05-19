import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Provides JwtService for WsJwtGuard
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
