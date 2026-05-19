// ──────────────────────────────────────────────────────────────────────────────
// packages/types/src/listing.ts
// Shared listing-domain types.
// ──────────────────────────────────────────────────────────────────────────────

/** Listing category (Electronics, Sports, Tools, etc.) */
export interface ListingCategoryPublic {
  id: string;
  name: string;
  icon: string | null;
}

/** Individual photo attached to a listing. */
export interface ListingMediaPublic {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

/** Public-safe listing projection. */
export interface ListingPublic {
  id: string;
  ownerId: string;
  ownerName: string | null;
  category: ListingCategoryPublic;
  title: string;
  description: string;
  pricePerDay: number; // serialised from Decimal
  deposit: number | null;
  isPublished: boolean;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  media: ListingMediaPublic[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

/** DTO shape for POST /listings */
export interface CreateListingInput {
  categoryId: string;
  title: string;
  description: string;
  pricePerDay: number;
  deposit?: number;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

/** DTO shape for PATCH /listings/:id */
export interface UpdateListingInput extends Partial<CreateListingInput> {
  isPublished?: boolean;
}

/** Returned after POST /listings/:id/media/presign */
export interface PresignedUrlResponse {
  uploadUrl: string; // PUT to this URL with the file as body
  r2Key: string;     // store and send back to confirmMedia
  publicUrl: string; // final permanent URL once upload succeeds
}

/** DTO shape for POST /listings/:id/media (confirm after upload) */
export interface ConfirmMediaInput {
  r2Key: string;
  url: string;
  order?: number;
  isPrimary?: boolean;
}

/** Paginated listing browse result */
export interface ListingsPage {
  data: ListingPublic[];
  total: number;
  page: number;
  limit: number;
}

/** Query params for GET /listings */
export interface ListingsQuery {
  city?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
