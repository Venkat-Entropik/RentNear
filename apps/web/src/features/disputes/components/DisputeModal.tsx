import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDisputeSchema, CreateDisputeInput } from '../types';
import { useCreateDispute } from '../hooks/useDisputes';
import { X, AlertTriangle } from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export function DisputeModal({ isOpen, onClose, bookingId }: DisputeModalProps) {
  const { mutateAsync: createDispute, isPending } = useCreateDispute();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDisputeInput>({
    resolver: zodResolver(createDisputeSchema),
    defaultValues: { bookingId, reason: '' },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateDisputeInput) => {
    try {
      await createDispute(data);
      reset();
      onClose();
    } catch (err) {
      // Handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3 text-red-600">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Report an Issue</h2>
        </div>

        <p className="mb-6 text-sm text-neutral-600">
          If there was a significant problem with this booking (e.g., item damaged, not returned, or fake listing), please describe the issue in detail. Our Trust & Safety team will review the case.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Reason for dispute
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              placeholder="Please explain what happened..."
              className={`input-field ${errors.reason ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-pill px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 px-6 py-2 text-sm"
            >
              {isPending ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
