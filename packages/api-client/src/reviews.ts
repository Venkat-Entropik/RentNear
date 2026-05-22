import { apiClient } from './client';
import type { CreateReviewInput, ReviewPublic, ReviewsPage } from '@rentnear/types';

/**
 * POST /listings/:id/reviews
 * Submit a review for a completed booking on a listing.
 */
export async function createReview(
  listingId: string,
  input: CreateReviewInput,
): Promise<ReviewPublic> {
  const res = await apiClient.post<ReviewPublic>(`/listings/${listingId}/reviews`, input);
  return res.data;
}

/**
 * GET /listings/:id/reviews
 * Fetch paginated reviews for a listing.
 */
export async function getListingReviews(
  listingId: string,
  page = 1,
  limit = 10,
): Promise<ReviewsPage> {
  const res = await apiClient.get<ReviewsPage>(`/listings/${listingId}/reviews`, {
    params: { page, limit },
  });
  return res.data;
}
