// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/app/(protected)/profile/page.tsx
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { ProfileView } from '@/features/profile/ProfileView';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your profile, addresses, and KYC verification on RentNear.',
};

export default function ProfilePage() {
  return <ProfileView />;
}
