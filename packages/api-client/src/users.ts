// ──────────────────────────────────────────────────────────────────────────────
// packages/api-client/src/users.ts
// Typed API functions for the Users & KYC module.
// ──────────────────────────────────────────────────────────────────────────────

import { apiClient } from './client';
import type {
  UserProfile,
  AddressPublic,
  KycDocumentPublic,
  UpdateProfileInput,
  CreateAddressInput,
  SubmitKycInput,
} from '@rentnear/types';

/** GET /users/me — full profile with addresses + KYC status. */
export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/users/me');
  return data;
}

/** PATCH /users/me — update name, email, or avatarUrl. */
export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await apiClient.patch<UserProfile>('/users/me', input);
  return data;
}

/** GET /users/me/addresses — list all saved addresses. */
export async function getAddresses(): Promise<AddressPublic[]> {
  const { data } = await apiClient.get<AddressPublic[]>('/users/me/addresses');
  return data;
}

/** POST /users/me/addresses — create a new address. */
export async function createAddress(input: CreateAddressInput): Promise<AddressPublic> {
  const { data } = await apiClient.post<AddressPublic>('/users/me/addresses', input);
  return data;
}

/** DELETE /users/me/addresses/:id — remove an address. */
export async function deleteAddress(addressId: string): Promise<void> {
  await apiClient.delete(`/users/me/addresses/${addressId}`);
}

/** POST /users/me/kyc — submit or resubmit KYC documents. */
export async function submitKyc(input: SubmitKycInput): Promise<KycDocumentPublic> {
  const { data } = await apiClient.post<KycDocumentPublic>('/users/me/kyc', input);
  return data;
}

/** GET /users/me/kyc — get current KYC document and status. */
export async function getKycStatus(): Promise<KycDocumentPublic | null> {
  const { data } = await apiClient.get<KycDocumentPublic | null>('/users/me/kyc');
  return data;
}
