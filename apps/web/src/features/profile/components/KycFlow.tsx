'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/components/KycFlow.tsx
//
// 3-step KYC submission flow:
//   select-doc → enter-details → review (confirm before submit)
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldCheck,
  FileText,
  CreditCard,
  Car,
  Globe,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { DocType, KycStatus } from '@rentnear/types';
import { useSubmitKyc, useKycStatus } from '../hooks/useProfile';
import { submitKycSchema, type SubmitKycValues, type KycStep } from '../types';
import { KycStatusBadge } from './KycStatusBadge';

// ── Doc type config ────────────────────────────────────────────────────────────
const DOC_OPTIONS = [
  {
    type: DocType.AADHAAR,
    label: 'Aadhaar Card',
    sub: '12-digit unique identity number',
    icon: CreditCard,
    requiresBack: true,
  },
  {
    type: DocType.PAN,
    label: 'PAN Card',
    sub: '10-character alphanumeric ID',
    icon: FileText,
    requiresBack: false,
  },
  {
    type: DocType.PASSPORT,
    label: 'Passport',
    sub: 'Valid Indian passport',
    icon: Globe,
    requiresBack: true,
  },
  {
    type: DocType.DRIVING_LICENSE,
    label: 'Driving License',
    sub: 'State-issued driving license',
    icon: Car,
    requiresBack: true,
  },
] as const;

export function KycFlow() {
  const { data: existingKyc, isLoading } = useKycStatus();
  const { mutate: submit, isPending, error } = useSubmitKyc();
  const [step, setStep] = useState<KycStep>('select-doc');
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmitKycValues>({
    resolver: zodResolver(submitKycSchema),
  });

  const selectedDocType = watch('docType');
  const selectedDoc = DOC_OPTIONS.find((d) => d.type === selectedDocType);

  const onFinalSubmit = (values: SubmitKycValues) => {
    // Strip empty-string optional fields before submitting
    const input: Parameters<typeof submit>[0] = {
      docType: values.docType,
      docNumber: values.docNumber,
      frontUrl: values.frontUrl,
      ...(values.backUrl ? { backUrl: values.backUrl } : {}),
      ...(values.selfieUrl ? { selfieUrl: values.selfieUrl } : {}),
    };
    submit(input, { onSuccess: () => setSubmitted(true) });
  };

  if (isLoading) {
    return (
      <div className="white-card flex items-center justify-center p-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
      </div>
    );
  }

  // Submitted this session
  if (submitted || existingKyc?.status === KycStatus.PENDING) {
    return (
      <div className="white-card flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <ShieldCheck className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">KYC Under Review</h3>
          <p className="mt-1 text-sm text-neutral-600">
            We&apos;ll verify your documents within 24–48 hours and notify you.
          </p>
        </div>
        {existingKyc && <KycStatusBadge status={existingKyc.status} />}
      </div>
    );
  }

  // Already verified
  if (existingKyc?.status === KycStatus.VERIFIED) {
    return (
      <div className="white-card flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">KYC Verified</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Your identity has been successfully verified.
          </p>
        </div>
        <KycStatusBadge status={KycStatus.VERIFIED} />
      </div>
    );
  }

  return (
    <div className="white-card p-6">
      {/* Progress indicator */}
      <div className="mb-6 flex items-center gap-2">
        {(['select-doc', 'enter-details', 'review'] as KycStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                s === step
                  ? 'bg-primary-500 text-white'
                  : ['enter-details', 'review'].includes(step) && i < ['select-doc', 'enter-details', 'review'].indexOf(step)
                  ? 'bg-success text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="h-px w-6 bg-neutral-200" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-neutral-500">
          Step {['select-doc', 'enter-details', 'review'].indexOf(step) + 1} of 3
        </span>
      </div>

      <form onSubmit={handleSubmit(onFinalSubmit)}>
        {/* ── Step 1: Choose document type ─────────────────────────────── */}
        {step === 'select-doc' && (
          <div className="animate-fade-in space-y-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Choose ID Type</h3>
              <p className="mt-1 text-sm text-neutral-600">Select a government-issued document to verify your identity.</p>
            </div>

            {/* Rejection note */}
            {existingKyc?.status === KycStatus.REJECTED && (
              <div className="alert-error">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <div>
                  <span className="font-medium">Previous submission rejected.</span>
                  {existingKyc.reviewNote && (
                    <p className="mt-0.5 text-xs">{existingKyc.reviewNote}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {DOC_OPTIONS.map(({ type, label, sub, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setValue('docType', type);
                    setStep('enter-details');
                  }}
                  className="flex w-full items-center justify-between rounded-[12px] border border-neutral-200 bg-neutral-50 p-4 text-left transition-all hover:border-primary-500 hover:bg-primary-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                      <Icon className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{label}</p>
                      <p className="text-xs text-neutral-500">{sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Enter details + upload URLs ──────────────────────── */}
        {step === 'enter-details' && selectedDoc && (
          <div className="animate-fade-in space-y-4">
            <button
              type="button"
              onClick={() => setStep('select-doc')}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Change document
            </button>

            <div>
              <h3 className="text-base font-semibold text-neutral-900">{selectedDoc.label} Details</h3>
              <p className="mt-1 text-sm text-neutral-600">Enter your document information accurately.</p>
            </div>

            <input type="hidden" {...register('docType')} />

            {/* Doc number */}
            <KycField label="Document Number" error={errors.docNumber?.message}>
              <input
                {...register('docNumber')}
                className="input-field"
                placeholder={
                  selectedDoc.type === DocType.AADHAAR
                    ? '1234 5678 9012'
                    : selectedDoc.type === DocType.PAN
                    ? 'ABCDE1234F'
                    : 'Enter number'
                }
              />
            </KycField>

            {/* Front image URL */}
            <KycField label="Front Image URL" error={errors.frontUrl?.message}>
              <input {...register('frontUrl')} type="url" className="input-field" placeholder="https://..." />
              <p className="text-xs text-neutral-500">Paste a publicly accessible URL of the front image.</p>
            </KycField>

            {/* Back image URL (conditional) */}
            {selectedDoc.requiresBack && (
              <KycField label="Back Image URL (optional)" error={errors.backUrl?.message}>
                <input {...register('backUrl')} type="url" className="input-field" placeholder="https://..." />
              </KycField>
            )}

            {/* Selfie URL */}
            <KycField label="Selfie URL (optional)" error={errors.selfieUrl?.message}>
              <input {...register('selfieUrl')} type="url" className="input-field" placeholder="https://..." />
            </KycField>

            <button
              type="button"
              onClick={() => setStep('review')}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              Review & Submit
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Step 3: Review & confirm ──────────────────────────────────── */}
        {step === 'review' && (
          <div className="animate-fade-in space-y-4">
            <button
              type="button"
              onClick={() => setStep('enter-details')}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit details
            </button>

            <div>
              <h3 className="text-base font-semibold text-neutral-900">Review Submission</h3>
              <p className="mt-1 text-sm text-neutral-600">Please confirm your details before submitting.</p>
            </div>

            <div className="rounded-[12px] bg-neutral-50 p-4 text-sm space-y-2">
              <ReviewRow label="Document Type" value={selectedDoc?.label ?? '—'} />
              <ReviewRow label="Document Number" value={watch('docNumber') ?? '—'} />
              <ReviewRow label="Front Image" value={watch('frontUrl') ? '✓ Provided' : '—'} />
              {selectedDoc?.requiresBack && (
                <ReviewRow label="Back Image" value={watch('backUrl') ? '✓ Provided' : 'Not provided'} />
              )}
              <ReviewRow label="Selfie" value={watch('selfieUrl') ? '✓ Provided' : 'Not provided'} />
            </div>

            {/* Privacy note */}
            <p className="text-xs text-neutral-500">
              🔒 Your documents are securely stored and only reviewed by our trust & safety team.
            </p>

            {/* API error */}
            {error && (
              <div className="alert-error">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {(error as { message?: string }).message ?? 'Submission failed. Please try again.'}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Submit for Verification
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function KycField({
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}
