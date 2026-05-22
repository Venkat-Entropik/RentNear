import { apiClient } from './client';
import type { ConversationPublic, MessagesPage } from '@rentnear/types';

/**
 * GET /chat/conversations
 * Fetch all conversations for the user's Inbox
 */
export async function getConversations(): Promise<ConversationPublic[]> {
  const res = await apiClient.get<ConversationPublic[]>('/chat/conversations');
  return res.data;
}

/**
 * POST /chat/conversations
 * Get or create a conversation for a listing
 */
export async function getOrCreateConversation(listingId: string): Promise<ConversationPublic> {
  const res = await apiClient.post<ConversationPublic>('/chat/conversations', { listingId });
  return res.data;
}

/**
 * GET /chat/conversations/:id/messages
 * Fetch paginated messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<MessagesPage> {
  const res = await apiClient.get<MessagesPage>(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });
  return res.data;
}
