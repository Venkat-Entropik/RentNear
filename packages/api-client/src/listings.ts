// ──────────────────────────────────────────────────────────────────────────────
// packages/api-client/src/listings.ts
// ──────────────────────────────────────────────────────────────────────────────

import { apiClient } from './client';
import type {
  ListingPublic,
  ListingCategoryPublic,
  ListingsPage,
  ListingsQuery,
  CreateListingInput,
  UpdateListingInput,
  PresignedUrlResponse,
  ConfirmMediaInput,
} from '@rentnear/types';

/** GET /listings/categories */
export async function getCategories(): Promise<ListingCategoryPublic[]> {
  const { data } = await apiClient.get<ListingCategoryPublic[]>('/listings/categories');
  return data;
}

/** GET /listings — public paginated browse */
export async function getListings(query: ListingsQuery = {}): Promise<ListingsPage> {
  const { data } = await apiClient.get<ListingsPage>('/listings', { params: query });
  return data;
}

/** GET /listings/:id — single listing detail */
export async function getListing(id: string): Promise<ListingPublic> {
  const { data } = await apiClient.get<ListingPublic>(`/listings/${id}`);
  return data;
}

/** GET /listings/mine — owner's own listings */
export async function getMyListings(): Promise<ListingPublic[]> {
  const { data } = await apiClient.get<ListingPublic[]>('/listings/mine');
  return data;
}

/** POST /listings — create draft */
export async function createListing(input: CreateListingInput): Promise<ListingPublic> {
  const { data } = await apiClient.post<ListingPublic>('/listings', input);
  return data;
}

/** PATCH /listings/:id */
export async function updateListing(id: string, input: UpdateListingInput): Promise<ListingPublic> {
  const { data } = await apiClient.patch<ListingPublic>(`/listings/${id}`, input);
  return data;
}

/** POST /listings/:id/publish */
export async function publishListing(id: string): Promise<ListingPublic> {
  const { data } = await apiClient.post<ListingPublic>(`/listings/${id}/publish`);
  return data;
}

/** DELETE /listings/:id */
export async function deleteListing(id: string): Promise<void> {
  await apiClient.delete(`/listings/${id}`);
}

/** POST /listings/:id/media/presign — get R2 upload URL */
export async function presignMedia(listingId: string): Promise<PresignedUrlResponse> {
  const { data } = await apiClient.post<PresignedUrlResponse>(
    `/listings/${listingId}/media/presign`,
  );
  return data;
}

/**
 * Upload a file directly to R2 using the presigned URL.
 * Uses fetch — works in both browser and Node environments.
 * Progress callback fires at 0% and 100% only (fetch doesn't expose upload progress).
 * For granular progress, use XHR directly in the component layer.
 */
export async function uploadToR2(
  uploadUrl: string,
  file: File | Blob,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0);
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file instanceof File ? file.type : 'application/octet-stream' },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`R2 upload failed with status ${response.status}`);
  }
  onProgress?.(100);
}

/** POST /listings/:id/media — confirm after successful upload */
export async function confirmMedia(
  listingId: string,
  input: ConfirmMediaInput,
): Promise<ListingPublic> {
  const { data } = await apiClient.post<ListingPublic>(`/listings/${listingId}/media`, input);
  return data;
}

/** DELETE /listings/:id/media/:mediaId */
export async function deleteMedia(listingId: string, mediaId: string): Promise<void> {
  await apiClient.delete(`/listings/${listingId}/media/${mediaId}`);
}
