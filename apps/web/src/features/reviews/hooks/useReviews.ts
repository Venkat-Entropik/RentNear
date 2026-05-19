import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, getListingReviews } from '@rentnear/api-client';
import type { CreateReviewInput } from '@rentnear/types';

export const reviewsKeys = {
  all: ['reviews'] as const,
  listing: (listingId: string) => [...reviewsKeys.all, listingId] as const,
};

export function useListingReviews(listingId: string, page = 1) {
  return useQuery({
    queryKey: [...reviewsKeys.listing(listingId), page],
    queryFn: () => getListingReviews(listingId, page),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, input }: { listingId: string; input: CreateReviewInput }) =>
      createReview(listingId, input),
    onSuccess: (_, variables) => {
      // Invalidate the listing reviews
      queryClient.invalidateQueries({ queryKey: reviewsKeys.listing(variables.listingId) });
      // We should also invalidate the listing itself so the average rating updates
      queryClient.invalidateQueries({ queryKey: ['listings', 'detail', variables.listingId] });
    },
  });
}
