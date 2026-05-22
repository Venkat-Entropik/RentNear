import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload, ConversationPublic, MessagesPage } from '@rentnear/types';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get all conversations for the user's Inbox
   */
  @Get('conversations')
  getConversations(@CurrentUser() user: JwtPayload): Promise<ConversationPublic[]> {
    return this.chatService.getUserConversations(user.sub);
  }

  /**
   * Ensure a conversation exists and return it
   */
  @Post('conversations')
  getOrCreateConversation(
    @CurrentUser() user: JwtPayload,
    @Body('listingId') listingId: string,
  ): Promise<ConversationPublic> {
    return this.chatService.getOrCreateConversation(user.sub, listingId);
  }

  /**
   * Get paginated messages for a conversation
   */
  @Get('conversations/:id/messages')
  getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id') conversationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ): Promise<MessagesPage> {
    return this.chatService.getMessages(user.sub, conversationId, page, limit);
  }
}
