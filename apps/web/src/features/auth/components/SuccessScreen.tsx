'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/components/SuccessScreen.tsx
//
// Step 3 — post-verification success state shown briefly before redirect.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { UserPublic } from '../types';

interface SuccessScreenProps {
  user: UserPublic;
}

export function SuccessScreen({ user }: SuccessScreenProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      // Cast required: Next.js typed routes treat '/' as RouteImpl<'/'>
      router.push('/' as Parameters<typeof router.push>[0]);
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="animate-fade-up flex flex-col items-center gap-5 py-4 text-center">
      {/* Success icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light ring-1 ring-success/30">
        <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
      </div>

      {/* Message */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-neutral-900">You&apos;re in! 🎉</h2>
        <p className="text-sm text-neutral-600">
          Welcome{user.name ? `, ${user.name}` : ' back'}. Taking you to your dashboard...
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary-500"
            style={{
              animation: 'pulse 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
