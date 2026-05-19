// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/store/authStore.ts
//
// Zustand store for auth state.
// Persists accessToken to localStorage for page refreshes.
// ──────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserPublic, AuthStep } from '@rentnear/types';

interface AuthState {
  // ── Server state ────────────────────────────────────────────────────────
  user: UserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;

  // ── UI state ────────────────────────────────────────────────────────────
  /** Current step in the multi-step OTP flow */
  step: AuthStep;
  /** Phone number carried from step 1 to step 2 */
  pendingPhone: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  setCredentials: (params: { user: UserPublic; accessToken: string; refreshToken: string }) => void;
  setPendingPhone: (phone: string) => void;
  setStep: (step: AuthStep) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Initial state ─────────────────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      step: 'phone',
      pendingPhone: null,

      // ── Actions ───────────────────────────────────────────────────────
      setCredentials: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, step: 'success' }),

      setPendingPhone: (phone) => set({ pendingPhone: phone, step: 'otp' }),

      setStep: (step) => set({ step }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          step: 'phone',
          pendingPhone: null,
        }),
    }),
    {
      name: 'rentnear-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist tokens and user — UI step is ephemeral
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
