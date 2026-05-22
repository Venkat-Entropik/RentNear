'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useConversations,
  useMessages,
  useChatSocket,
  useGetOrCreateConversation,
} from '@/features/chat/hooks/useChat';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Header } from '@/components/Header';

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialListingId = searchParams.get('listingId');

  const { user } = useAuthStore();
  const { data: conversations, isLoading: isLoadingConvos } = useConversations();
  const { mutateAsync: getOrCreateConversation } = useGetOrCreateConversation();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(activeConversationId);
  const { sendMessage } = useChatSocket(activeConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If we came from a listing with ?listingId=xxx, get or create that conversation and select it
  useEffect(() => {
    if (initialListingId && conversations) {
      const existing = conversations.find((c) => c.listingId === initialListingId);
      if (existing) {
        setActiveConversationId(existing.id);
        router.replace('/inbox' as any); // Clear param
      } else {
        // Need to create it
        getOrCreateConversation(initialListingId).then((newConv) => {
          setActiveConversationId(newConv.id);
          router.replace('/inbox' as any); // Clear param
        });
      }
    } else if (
      conversations &&
      conversations.length > 0 &&
      !activeConversationId &&
      !initialListingId
    ) {
      // Auto-select first conversation
      setActiveConversationId(conversations[0]?.id || null);
    }
  }, [initialListingId, conversations, activeConversationId, getOrCreateConversation, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData?.data]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversationId) return;
    sendMessage(messageText.trim());
    setMessageText('');
  };

  const activeConversation = conversations?.find((c) => c.id === activeConversationId);
  const otherUser =
    activeConversation?.renterId === user?.id
      ? activeConversation?.owner
      : activeConversation?.renter;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex">
        <div className="white-card w-full flex overflow-hidden h-[calc(100vh-8rem)]">
          {/* Left Pane: Conversation List */}
          <div className="w-full md:w-1/3 border-r border-neutral-200 flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">Inbox</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConvos ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
              ) : conversations?.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">No messages yet.</div>
              ) : (
                conversations?.map((conv) => {
                  const isMe = conv.renterId === user?.id;
                  const participant = isMe ? conv.owner : conv.renter;
                  const latestMsg = conv.messages?.[0];

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full text-left p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
                        activeConversationId === conv.id ? 'bg-primary-50 hover:bg-primary-50' : ''
                      }`}
                    >
                      <img
                        src={
                          participant?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${participant?.name || 'U'}`
                        }
                        alt={participant?.name || 'User'}
                        className="h-12 w-12 rounded-full object-cover bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-neutral-900 truncate">
                            {participant?.name || 'Unknown'}
                          </h3>
                          {latestMsg && (
                            <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                              {formatDistanceToNow(new Date(latestMsg.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary-600 truncate mt-0.5">
                          {conv.listing?.title}
                        </p>
                        <p className="text-sm text-neutral-500 truncate mt-0.5">
                          {latestMsg ? latestMsg.content : 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Chat History */}
          <div className="hidden md:flex flex-col flex-1 bg-white">
            {activeConversationId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-neutral-200 flex items-center gap-3 bg-white">
                  <img
                    src={
                      otherUser?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.name || 'U'}`
                    }
                    alt={otherUser?.name || 'User'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-neutral-900">{otherUser?.name}</h3>
                    <p className="text-xs text-neutral-500">
                      Regarding: {activeConversation?.listing?.title}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
                  {isLoadingMessages ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                  ) : (
                    // Reverse the array because API returns desc, but we want oldest at top
                    [...(messagesData?.data || [])].reverse().map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                              isMe
                                ? 'bg-primary-500 text-white rounded-tr-sm'
                                : 'bg-white border border-neutral-200 text-neutral-900 rounded-tl-sm shadow-sm'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span
                              className={`text-[10px] mt-1 block ${isMe ? 'text-primary-100' : 'text-neutral-400'}`}
                            >
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-neutral-200">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="input-field flex-1 !rounded-full"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="btn-primary !rounded-full p-3 flex-shrink-0 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                <MessageSquare className="h-16 w-16 mb-4 text-neutral-200" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
