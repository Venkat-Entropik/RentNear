'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/hooks/useProfile.ts
// React Query hooks for all profile data fetching and mutations.
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMe,
  updateProfile,
  getAddresses,
  createAddress,
  deleteAddress,
  submitKyc,
  getKycStatus,
} from '@rentnear/api-client';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { UpdateProfileInput, CreateAddressInput, SubmitKycInput } from '@rentnear/types';

// ── Query keys ────────────────────────────────────────────────────────────────
export const profileKeys = {
  me: ['profile', 'me'] as const,
  addresses: ['profile', 'addresses'] as const,
  kyc: ['profile', 'kyc'] as const,
};

// ── GET /users/me ─────────────────────────────────────────────────────────────
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
    enabled: !!accessToken, // only fetch when logged in
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ── PATCH /users/me ───────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (updatedUser) => {
      qc.setQueryData(profileKeys.me, updatedUser);
    },
  });
}

// ── GET /users/me/addresses ───────────────────────────────────────────────────
export function useAddresses() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: profileKeys.addresses,
    queryFn: getAddresses,
    enabled: !!accessToken,
  });
}

// ── POST /users/me/addresses ──────────────────────────────────────────────────
export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) => createAddress(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileKeys.addresses });
    },
  });
}

// ── DELETE /users/me/addresses/:id ───────────────────────────────────────────
export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileKeys.addresses });
    },
  });
}

// ── POST /users/me/kyc ────────────────────────────────────────────────────────
export function useSubmitKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitKycInput) => submitKyc(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileKeys.kyc });
      void qc.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}

// ── GET /users/me/kyc ─────────────────────────────────────────────────────────
export function useKycStatus() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: profileKeys.kyc,
    queryFn: getKycStatus,
    enabled: !!accessToken,
  });
}
