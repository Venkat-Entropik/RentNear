import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, getOrCreateConversation } from '@rentnear/api-client';
import type { MessagePublic } from '@rentnear/types';
import { useAuthStore } from '@/features/auth/store/authStore';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

export function useConversations() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: getConversations,
    enabled: !!accessToken,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId!),
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useGetOrCreateConversation() {
  return useMutation({
    mutationFn: getOrCreateConversation,
  });
}

export function useChatSocket(conversationId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    // Use environment variable for WebSocket URL, fallback to localhost for dev
    const wsUrl =
      process.env['NEXT_PUBLIC_API_URL']?.replace('http', 'ws') || 'ws://localhost:3001';

    const newSocket = io(`${wsUrl}/chat`, {
      auth: { token: accessToken },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join room
    socket.emit('joinConversation', { conversationId });

    // Listen for new messages
    socket.on('newMessage', (message: MessagePublic) => {
      // Update messages cache
      queryClient.setQueryData(chatKeys.messages(conversationId), (oldData: any) => {
        if (!oldData) return { data: [message], total: 1, page: 1, limit: 50, totalPages: 1 };
        return {
          ...oldData,
          data: [message, ...oldData.data], // Prepend since data is ordered desc
        };
      });

      // Update conversations cache (Inbox preview)
      queryClient.setQueryData(chatKeys.conversations(), (oldData: any) => {
        if (!oldData) return oldData;
        const index = oldData.findIndex((c: any) => c.id === conversationId);
        if (index === -1) return oldData;

        const newConversations = [...oldData];
        newConversations[index] = {
          ...newConversations[index],
          messages: [message], // Update preview
          updatedAt: message.createdAt,
        };
        // Move updated conversation to top
        const updatedConv = newConversations.splice(index, 1)[0];
        newConversations.unshift(updatedConv);

        return newConversations;
      });
    });

    return () => {
      socket.emit('leaveConversation', { conversationId });
      socket.off('newMessage');
    };
  }, [socket, conversationId, queryClient]);

  const sendMessage = (content: string) => {
    if (socket && conversationId) {
      socket.emit('sendMessage', { conversationId, content });
    }
  };

  return { sendMessage };
}
