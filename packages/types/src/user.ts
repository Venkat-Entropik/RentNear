// ──────────────────────────────────────────────────────────────────────────────
// packages/types/src/user.ts
// Shared user-domain types — used by API, web, and mobile.
// ──────────────────────────────────────────────────────────────────────────────

/** User roles controlling platform capabilities. */
export enum Role {
  OWNER = 'OWNER',
  RENTER = 'RENTER',
  ADMIN = 'ADMIN',
}

/** KYC verification lifecycle states. */
export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/** Accepted identity document types. */
export enum DocType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
}

/** Public-safe user projection — never includes hashed secrets. */
export interface UserPublic {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
  kycStatus: KycStatus;
  createdAt: string; // ISO-8601
}

/** Single address in the user's address book. */
export interface AddressPublic {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

/** KYC document record returned to the user. */
export interface KycDocumentPublic {
  id: string;
  docType: DocType;
  docNumber: string;
  frontUrl: string;
  backUrl: string | null;
  selfieUrl: string | null;
  status: KycStatus;
  reviewNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

/** User profile with expanded relations — used on the /me endpoint. */
export interface UserProfile extends UserPublic {
  addresses: AddressPublic[];
  kycDocument: KycDocumentPublic | null;
}

/** DTO shape for PATCH /users/me */
export interface UpdateProfileInput {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

/** DTO shape for POST /users/me/addresses */
export interface CreateAddressInput {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

/** DTO shape for POST /users/me/kyc */
export interface SubmitKycInput {
  docType: DocType;
  docNumber: string;
  frontUrl: string;
  backUrl?: string;
  selfieUrl?: string;
}
