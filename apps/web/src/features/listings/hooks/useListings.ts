'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/listings/hooks/useListings.ts
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  getListings,
  getListing,
  getMyListings,
  createListing,
  updateListing,
  publishListing,
  deleteListing,
  presignMedia,
  uploadToR2,
  confirmMedia,
  deleteMedia,
} from '@rentnear/api-client';
import type {
  CreateListingInput,
  UpdateListingInput,
  ConfirmMediaInput,
  ListingsQuery,
} from '@rentnear/types';

export const listingKeys = {
  categories: ['listings', 'categories'] as const,
  all: (q: ListingsQuery) => ['listings', 'all', q] as const,
  mine: ['listings', 'mine'] as const,
  detail: (id: string) => ['listings', 'detail', id] as const,
};

export function useCategories() {
  return useQuery({ queryKey: listingKeys.categories, queryFn: getCategories, staleTime: Infinity });
}

export function useListings(query: ListingsQuery = {}) {
  return useQuery({
    queryKey: listingKeys.all(query),
    queryFn: () => getListings(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => getListing(id),
    enabled: Boolean(id),
  });
}

export function useMyListings() {
  return useQuery({ queryKey: listingKeys.mine, queryFn: getMyListings });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) => createListing(input),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: listingKeys.mine }); },
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateListingInput }) =>
      updateListing(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(listingKeys.detail(updated.id), updated);
      void qc.invalidateQueries({ queryKey: listingKeys.mine });
    },
  });
}

export function usePublishListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishListing(id),
    onSuccess: (updated) => {
      qc.setQueryData(listingKeys.detail(updated.id), updated);
      void qc.invalidateQueries({ queryKey: listingKeys.mine });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: listingKeys.mine }); },
  });
}

/** Full presign → XHR upload → confirm pipeline */
export function useUploadMedia(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      isPrimary = false,
      onProgress,
    }: {
      file: File;
      isPrimary?: boolean;
      onProgress?: (pct: number) => void;
    }) => {
      const { uploadUrl, r2Key, publicUrl } = await presignMedia(listingId);
      await uploadToR2(uploadUrl, file, onProgress);
      const input: ConfirmMediaInput = {
        r2Key,
        url: publicUrl,
        isPrimary,
        order: 0,
      };
      return confirmMedia(listingId, input);
    },
    onSuccess: (updated) => {
      qc.setQueryData(listingKeys.detail(updated.id), updated);
      void qc.invalidateQueries({ queryKey: listingKeys.mine });
    },
  });
}

export function useDeleteMedia(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => deleteMedia(listingId, mediaId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
      void qc.invalidateQueries({ queryKey: listingKeys.mine });
    },
  });
}
