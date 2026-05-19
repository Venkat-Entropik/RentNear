export interface ReviewPublic {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO String

  user?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateReviewInput {
  rating: number; // 1-5
  comment: string;
}

export interface ReviewsPage {
  data: ReviewPublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
