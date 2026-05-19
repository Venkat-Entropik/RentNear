'use client';

// CreateListingForm.tsx — Step 1: details + category selection

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Loader2 } from 'lucide-react';
import { createListingSchema, type CreateListingValues } from '../types';
import { useCategories } from '../hooks/useListings';

interface CreateListingFormProps {
  defaultValues?: Partial<CreateListingValues>;
  onNext: (values: CreateListingValues) => void;
}

export function CreateListingForm({ defaultValues, onNext }: CreateListingFormProps) {
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListingValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      categoryId: defaultValues?.categoryId ?? '',
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      // pricePerDay/deposit left undefined so inputs stay empty
    },
  });

  const onSubmit = (values: CreateListingValues) => onNext(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-h2 text-neutral-900">What are you renting out?</h2>
        <p className="mt-1 text-sm text-neutral-600">Add details so renters know exactly what to expect.</p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-800">Category</label>
        {catsLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
          </div>
        ) : (
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => field.onChange(cat.id)}
                    className={`flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm font-medium transition-all ${
                      field.value === cat.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-primary-300'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          />
        )}
        {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
      </div>

      {/* Title */}
      <Field label="Title" error={errors.title?.message}>
        <input {...register('title')} className="input-field" placeholder="Nikon D750 DSLR Camera" />
      </Field>

      {/* Description */}
      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field resize-none"
          placeholder="Describe the item, its condition, what's included…"
        />
      </Field>

      {/* Price + Deposit */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price per Day (₹)" error={errors.pricePerDay?.message}>
          <input
            {...register('pricePerDay', { valueAsNumber: true })}
            type="number"
            min={1}
            step={1}
            className="input-field"
            placeholder="500"
          />
        </Field>
        <Field label="Deposit (₹) — optional" error={errors.deposit?.message}>
          <input
            {...register('deposit', { valueAsNumber: true })}
            type="number"
            min={0}
            step={1}
            className="input-field"
            placeholder="1000"
          />
        </Field>
      </div>

      <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2">
        Next: Location
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
