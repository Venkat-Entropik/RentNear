'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/components/AddressForm.tsx
// Form for creating a new address — used inside a modal sheet.
// ──────────────────────────────────────────────────────────────────────────────

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { createAddressSchema, type CreateAddressValues } from '../types';
import { useCreateAddress } from '../hooks/useProfile';

interface AddressFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const LABELS = ['Home', 'Work', 'Other'];

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const { mutate: create, isPending, error } = useCreateAddress();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAddressValues>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: { label: 'Home', isDefault: false },
  });

  const onSubmit = (values: CreateAddressValues) => {
    // Explicitly build input to satisfy exactOptionalPropertyTypes
    create(
      {
        label: values.label,
        street: values.street,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        ...(values.isDefault !== undefined ? { isDefault: values.isDefault } : {}),
      },
      { onSuccess },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Label selector */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-neutral-800">Label</label>
        <div className="flex gap-2">
          {LABELS.map((l) => (
            <label key={l} className="cursor-pointer">
              <input type="radio" value={l} {...register('label')} className="sr-only" />
              <span className="block rounded-pill border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-700 transition-colors peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700">
                {l}
              </span>
            </label>
          ))}
        </div>
        {errors.label && <p className="text-xs text-danger">{errors.label.message}</p>}
      </div>

      {/* Street */}
      <Field label="Street Address" error={errors.street?.message}>
        <input
          {...register('street')}
          className="input-field"
          placeholder="42 MG Road, Anna Nagar"
        />
      </Field>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" error={errors.city?.message}>
          <input {...register('city')} className="input-field" placeholder="Chennai" />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <input {...register('state')} className="input-field" placeholder="Tamil Nadu" />
        </Field>
      </div>

      {/* Pincode */}
      <Field label="Pincode" error={errors.pincode?.message}>
        <input
          {...register('pincode')}
          inputMode="numeric"
          maxLength={6}
          className="input-field"
          placeholder="600001"
        />
      </Field>

      {/* Set as default */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          {...register('isDefault')}
          className="h-4 w-4 rounded accent-primary-500"
        />
        <span className="text-sm text-neutral-700">Set as default address</span>
      </label>

      {/* API error */}
      {error && (
        <div className="alert-error">
          {(error as { message?: string }).message ?? 'Failed to save address.'}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-pill border border-neutral-200 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary flex flex-1 items-center justify-center gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Address
        </button>
      </div>
    </form>
  );
}

function Field({
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
