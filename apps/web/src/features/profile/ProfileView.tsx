'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/ProfileView.tsx
// Orchestrator — tabbed layout: Profile | Addresses | KYC
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { User, MapPin, ShieldCheck } from 'lucide-react';
import { ProfileCard } from './components/ProfileCard';
import { AddressBook } from './components/AddressBook';
import { KycFlow } from './components/KycFlow';

type Tab = 'profile' | 'addresses' | 'kyc';

const TABS = [
  { id: 'profile' as Tab, label: 'Profile', icon: User },
  { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
  { id: 'kyc' as Tab, label: 'KYC', icon: ShieldCheck },
];

export function ProfileView() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="mx-auto min-h-screen max-w-[390px] px-4 py-6 sm:max-w-2xl sm:px-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-hero text-neutral-900">My Account</h1>
        <p className="mt-1 text-body text-neutral-600">Manage your profile, addresses and KYC.</p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-[12px] bg-neutral-100 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`profile-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-primary-500 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="animate-fade-in">
        {activeTab === 'profile' && <ProfileCard />}
        {activeTab === 'addresses' && <AddressBook />}
        {activeTab === 'kyc' && <KycFlow />}
      </div>
    </div>
  );
}
