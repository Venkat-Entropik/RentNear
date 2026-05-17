'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/components/KycStatusBadge.tsx
// ──────────────────────────────────────────────────────────────────────────────

import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { KycStatus } from '@rentnear/types';

interface KycStatusBadgeProps {
  status: KycStatus;
  size?: 'sm' | 'md';
}

const CONFIG = {
  [KycStatus.VERIFIED]: {
    label: 'Verified',
    icon: ShieldCheck,
    className: 'bg-success-light text-success border-success/20',
  },
  [KycStatus.REJECTED]: {
    label: 'Rejected',
    icon: ShieldAlert,
    className: 'bg-danger-light text-danger border-danger/20',
  },
  [KycStatus.PENDING]: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
} as const;

export function KycStatusBadge({ status, size = 'md' }: KycStatusBadgeProps) {
  const { label, icon: Icon, className } = CONFIG[status];
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 font-medium ${textSize} ${className}`}
    >
      <Icon className={iconSize} />
      {label}
    </span>
  );
}
