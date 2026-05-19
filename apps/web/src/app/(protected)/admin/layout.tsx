'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If not admin, kick them out
    if (user && user.role !== 'ADMIN') {
      router.replace('/' as any);
    }
  }, [user, router]);

  // Optionally could wait for user to load if we had a loading state
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return <>{children}</>;
}
