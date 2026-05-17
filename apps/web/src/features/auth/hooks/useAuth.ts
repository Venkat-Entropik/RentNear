'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/hooks/useAuth.ts
//
// React Query mutations for auth operations.
// Bridges the API client with the Zustand store.
// ──────────────────────────────────────────────────────────────────────────────

import { useMutation } from '@tanstack/react-query';
import { sendOtp, verifyOtp } from '@rentnear/api-client';
import { useAuthStore } from '../store/authStore';
import { normalisePhone } from '../types';

// ── Send OTP mutation ─────────────────────────────────────────────────────────

/**
 * useSendOtp
 * Calls POST /auth/send-otp and advances the auth step to 'otp' on success.
 *
 * Usage:
 *   const { mutate, isPending, error } = useSendOtp();
 *   mutate({ phone: '+919876543210' });
 */
export function useSendOtp() {
  const { setPendingPhone } = useAuthStore();

  return useMutation({
    mutationFn: async (phone: string) => {
      const normalisedPhone = normalisePhone(phone);
      const result = await sendOtp({ phone: normalisedPhone });
      return { result, normalisedPhone };
    },
    onSuccess: ({ normalisedPhone }) => {
      setPendingPhone(normalisedPhone);
    },
  });
}

// ── Verify OTP mutation ───────────────────────────────────────────────────────

/**
 * useVerifyOtp
 * Calls POST /auth/verify-otp and stores the tokens + user in Zustand on success.
 *
 * Usage:
 *   const { mutate, isPending, error } = useVerifyOtp();
 *   mutate({ otp: '123456' });
 */
export function useVerifyOtp() {
  const { pendingPhone, setCredentials } = useAuthStore();

  return useMutation({
    mutationFn: async (otp: string) => {
      if (!pendingPhone) throw new Error('No phone number found. Please restart.');
      return verifyOtp({ phone: pendingPhone, otp });
    },
    onSuccess: (data) => {
      setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}
