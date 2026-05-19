// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/app/(protected)/layout.tsx
//
// Auth-guard layout — redirects to /auth if no access token in Zustand.
// Wraps all pages under the (protected) route group.
// ──────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace('/auth');
    }
  }, [accessToken, router]);

  if (!accessToken) {
    // Prevent flash of protected content while redirecting
    return null;
  }

  return <>{children}</>;
}
