// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/app/auth/page.tsx  (Server Component — no 'use client')
//
// Auth page — App Router Server Component wrapper.
// Exports metadata for SEO, delegates rendering to AuthView (Client Component).
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { AuthView } from '@/features/auth/AuthView';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to RentNear with your mobile number — no password required.',
};

export default function AuthPage() {
  return <AuthView />;
}
