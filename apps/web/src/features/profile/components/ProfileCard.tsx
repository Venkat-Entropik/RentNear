'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/components/ProfileCard.tsx
// User identity card — name, phone, email, avatar. Inline edit via RHF.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Mail, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useMe, useUpdateProfile } from '../hooks/useProfile';
import { updateProfileSchema, type UpdateProfileValues } from '../types';
import { KycStatusBadge } from './KycStatusBadge';

export function ProfileCard() {
  const [editing, setEditing] = useState(false);
  const { data: profile, isLoading } = useMe();
  const { mutate: update, isPending, error } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
      avatarUrl: profile?.avatarUrl ?? '',
    },
  });

  const onSubmit = (values: UpdateProfileValues) => {
    // Strip empty strings — only send fields that have a value
    const payload: Record<string, string> = {};
    if (values.name) payload['name'] = values.name;
    if (values.email) payload['email'] = values.email;
    if (values.avatarUrl) payload['avatarUrl'] = values.avatarUrl;
    update(payload, { onSuccess: () => setEditing(false) });
  };

  const cancelEdit = () => {
    reset();
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="white-card flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="white-card p-6">
      {/* Header row */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500 ring-2 ring-primary-100">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name ?? 'Avatar'}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          {/* Name + KYC badge */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {profile.name ?? 'No name set'}
            </h2>
            <div className="mt-1">
              <KycStatusBadge status={profile.kycStatus} size="sm" />
            </div>
          </div>
        </div>

        {/* Edit / Cancel toggle */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-chip bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1.5 rounded-chip bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
      </div>

      {/* Info / Form */}
      {!editing ? (
        <dl className="space-y-3">
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={profile.email ?? '—'}
          />
        </dl>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField label="Full Name" error={errors.name?.message}>
            <input
              {...register('name')}
              className="input-field"
              placeholder="Arjun Kumar"
            />
          </FormField>

          {/* Email */}
          <FormField label="Email Address" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              className="input-field"
              placeholder="arjun@example.com"
            />
          </FormField>

          {/* Avatar URL */}
          <FormField label="Avatar URL (optional)" error={errors.avatarUrl?.message}>
            <input
              {...register('avatarUrl')}
              type="url"
              className="input-field"
              placeholder="https://..."
            />
          </FormField>

          {/* API error */}
          {error && (
            <p className="text-sm text-danger">
              {(error as { message?: string }).message ?? 'Something went wrong.'}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex items-center gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-neutral-400">{icon}</span>
      <div>
        <dt className="text-xs text-neutral-500">{label}</dt>
        <dd className="text-sm font-medium text-neutral-900">{value}</dd>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-800">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
