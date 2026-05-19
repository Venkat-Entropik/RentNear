'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/components/PhoneInput.tsx
//
// Step 1 of the auth flow — phone number entry.
// Features:
//  - Country code prefix (+91)
//  - React Hook Form + Zod validation
//  - Loading spinner on submit
//  - Error alert
// ──────────────────────────────────────────────────────────────────────────────

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smartphone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { phoneFormSchema, type PhoneFormValues } from '../types';

interface PhoneInputProps {
  onSuccess: (phone: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (phone: string) => void;
}

export function PhoneInput({ onSuccess: _onSuccess, isLoading, error, onSubmit }: PhoneInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
  });

  const handleFormSubmit = (values: PhoneFormValues) => {
    onSubmit(values.phone);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Heading */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold text-neutral-900">Welcome back 👋</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Enter your mobile number to receive a one-time passcode.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        {/* Phone input with country code prefix */}
        <div className="space-y-2">
          <label htmlFor="phone-input" className="block text-sm font-medium text-neutral-800">
            Mobile Number
          </label>
          <div className="relative flex">
            {/* Country code badge */}
            <div className="flex items-center gap-2 rounded-l-[12px] border border-transparent border-r-0 bg-neutral-100 px-3.5 py-3.5 text-sm font-medium text-neutral-600">
              <span className="text-base">🇮🇳</span>
              <span>+91</span>
            </div>
            {/* Phone number field */}
            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              placeholder="98765 43210"
              className={`input-field rounded-l-none border-l-0 focus:border-l ${
                errors.phone ? 'error' : ''
              }`}
              {...register('phone')}
            />
            {/* Icon */}
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <Smartphone className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
          {/* Inline field error */}
          {errors.phone && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* API-level error alert */}
        {error && !errors.phone && (
          <div className="alert-error animate-fade-in" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          id="send-otp-btn"
          type="submit"
          disabled={isLoading}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Social proof */}
      <p className="text-center text-xs text-neutral-400">
        🔒 We never share your number with third parties
      </p>
    </div>
  );
}
