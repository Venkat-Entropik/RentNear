'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/components/AuthCard.tsx
//
// Glass card wrapper — centred layout with logo + brand for the auth page.
// ──────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { MapPin } from 'lucide-react';

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    // ── Page background ────────────────────────────────────────────────────
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div className="white-card animate-fade-up relative z-10 w-full max-w-[390px] p-8 sm:p-10">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="animate-pulse-ring mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100">
            <MapPin className="h-7 w-7 text-primary-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">RentNear</h1>
          <p className="mt-1 text-sm text-neutral-600">Rent anything from your neighbours</p>
        </div>

        {/* Feature content (phone input or OTP input) */}
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-center text-xs text-neutral-400">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900">
          Terms
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
