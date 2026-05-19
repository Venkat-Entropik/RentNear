import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env['CORS_ORIGINS']?.split(',') || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // We handle authentication via the Guard on specific events,
    // or we can extract the token from headers/handshake here.
    // For simplicity, we'll let the WsJwtGuard protect the `sendMessage` event.
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation_${data.conversationId}`);
    return { event: 'joined', data: { conversationId: data.conversationId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation_${data.conversationId}`);
    return { event: 'left', data: { conversationId: data.conversationId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: any, // any to bypass strict type for user attached by guard
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = client.user.sub;

    try {
      // Create message in DB
      const message = await this.chatService.createMessage(
        userId,
        data.conversationId,
        data.content,
      );

      // Broadcast to everyone in the conversation room (including the sender)
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', message);

      // Also broadcast a generic notification event for Inbox updating
      // In a real app we might want to emit to specific user rooms (e.g. `user_${ownerId}`)
      // For now, we emit to the conversation room.

      return { status: 'success' };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  }
}
