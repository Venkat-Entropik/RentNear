'use client';

// LocationStep.tsx — Step 2: city, state, pincode

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const locationSchema = z.object({
  city: z.string().min(1, 'City is required').max(80),
  state: z.string().min(1, 'State is required').max(80),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

type LocationValues = z.infer<typeof locationSchema>;

interface LocationStepProps {
  defaultValues?: Partial<LocationValues> | undefined;
  onNext: (values: LocationValues) => void;
  onBack: () => void;
}

export function LocationStep({ defaultValues, onNext, onBack }: LocationStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    ...(defaultValues ? { defaultValues } : {}),
  });

  const onSubmit = (values: LocationValues) => onNext(values);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h2 className="text-h2 text-neutral-900">Where is the item located?</h2>
        <p className="mt-1 text-sm text-neutral-600">Renters nearby will discover your listing first.</p>
      </div>

      <Field label="City" error={errors.city?.message}>
        <input {...register('city')} className="input-field" placeholder="Chennai" />
      </Field>

      <Field label="State" error={errors.state?.message}>
        <input {...register('state')} className="input-field" placeholder="Tamil Nadu" />
      </Field>

      <Field label="Pincode" error={errors.pincode?.message}>
        <input {...register('pincode')} inputMode="numeric" maxLength={6} className="input-field" placeholder="600001" />
      </Field>

      <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2">
        Next: Add Photos
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-800">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
