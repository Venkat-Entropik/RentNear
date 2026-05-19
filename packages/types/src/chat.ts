export interface MessagePublic {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string; // ISO String
}

export interface ConversationPublic {
  id: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;

  listing?: {
    id: string;
    title: string;
    media: Array<{ url: string }>;
  };
  renter?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  owner?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  messages?: MessagePublic[]; // For inbox previews (e.g. the latest message)
}

export interface MessagesPage {
  data: MessagePublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
