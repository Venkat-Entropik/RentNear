import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ConversationPublic, MessagePublic, MessagesPage } from '@rentnear/types';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private formatMessage(msg: any): MessagePublic {
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  private formatConversation(conv: any): ConversationPublic {
    const formatted: ConversationPublic = {
      id: conv.id,
      listingId: conv.listingId,
      renterId: conv.renterId,
      ownerId: conv.ownerId,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    };

    if (conv.listing) {
      formatted.listing = {
        id: conv.listing.id,
        title: conv.listing.title,
        media: conv.listing.media || [],
      };
    }
    if (conv.renter) {
      formatted.renter = {
        id: conv.renter.id,
        name: conv.renter.name,
        avatarUrl: conv.renter.avatarUrl,
      };
    }
    if (conv.owner) {
      formatted.owner = {
        id: conv.owner.id,
        name: conv.owner.name,
        avatarUrl: conv.owner.avatarUrl,
      };
    }
    if (conv.messages) {
      formatted.messages = conv.messages.map((m: any) => this.formatMessage(m));
    }

    return formatted;
  }

  /**
   * Get or create a conversation between a renter and an owner for a listing
   */
  async getOrCreateConversation(renterId: string, listingId: string): Promise<ConversationPublic> {
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        listingId_renterId: { listingId, renterId },
      },
      include: {
        listing: { include: { media: { take: 1 } } },
        renter: true,
        owner: true,
      },
    });

    if (!conversation) {
      const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) throw new NotFoundException('Listing not found');

      if (listing.ownerId === renterId) {
        throw new ForbiddenException('You cannot start a conversation with yourself.');
      }

      conversation = await this.prisma.conversation.create({
        data: {
          listingId,
          renterId,
          ownerId: listing.ownerId,
        },
        include: {
          listing: { include: { media: { take: 1 } } },
          renter: true,
          owner: true,
        },
      });
    }

    return this.formatConversation(conversation);
  }

  /**
   * Fetch all conversations for a user (Inbox view)
   */
  async getUserConversations(userId: string): Promise<ConversationPublic[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { renterId: userId },
          { ownerId: userId },
        ],
      },
      include: {
        listing: { include: { media: { take: 1, orderBy: { order: 'asc' } } } },
        renter: true,
        owner: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the latest message for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map(c => this.formatConversation(c));
  }

  /**
   * Fetch messages for a specific conversation
   */
  async getMessages(userId: string, conversationId: string, page = 1, limit = 50): Promise<MessagesPage> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.renterId !== userId && conversation.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to view this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' }, // Descending for pagination, frontend will reverse it to display bottom-to-top
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark messages as read if the current user didn't send them
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      data: messages.map(this.formatMessage),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new message
   */
  async createMessage(senderId: string, conversationId: string, content: string): Promise<MessagePublic> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.renterId !== senderId && conversation.ownerId !== senderId) {
      throw new ForbiddenException('Not authorized to message in this conversation');
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
      });

      // Update the conversation's updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    return this.formatMessage(message);
  }
}
