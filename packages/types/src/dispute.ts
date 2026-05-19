export interface DisputePublic {
  id: string;
  bookingId: string;
  initiatorId: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  adminNotes: string | null;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String

  booking?: {
    id: string;
    status: string;
    listing?: {
      id: string;
      title: string;
      media: Array<{ url: string }>;
    };
  };
  initiator?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface DisputesPage {
  data: DisputePublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
