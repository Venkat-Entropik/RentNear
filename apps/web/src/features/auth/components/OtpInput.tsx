'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/components/OtpInput.tsx
//
// Step 2 — 6-digit OTP entry.
// Features:
//  - 6 individual digit boxes with auto-advance on input
//  - Keyboard-aware: Backspace to go back, paste support
//  - Resend OTP with countdown timer
//  - Shake animation on wrong OTP
//  - Auto-submits when all 6 digits are filled
// ──────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

interface OtpInputProps {
  phone: string;
  isLoading: boolean;
  error: string | null;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  isResending: boolean;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export function OtpInput({
  phone,
  isLoading,
  error,
  onSubmit,
  onResend,
  onBack,
  isResending,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Focus first input on mount ─────────────────────────────────────────────
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Resend countdown timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Shake on error ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      setShake(true);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setTimeout(() => setShake(false), 400);
    }
  }, [error]);

  // ── Auto-submit when all digits filled ────────────────────────────────────
  const submitIfComplete = useCallback(
    (newDigits: string[]) => {
      if (newDigits.every((d) => d !== '')) {
        onSubmit(newDigits.join(''));
      }
    },
    [onSubmit],
  );

  // ── Handle single digit input ──────────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    submitIfComplete(newDigits);
  };

  // ── Handle keyboard navigation ─────────────────────────────────────────────
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Handle paste (e.g. auto-fill from SMS on mobile) ─────────────────────
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = [...digits];
    pasted.split('').forEach((char, i) => {
      if (i < OTP_LENGTH) newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus the next empty box or the last box
    const nextEmpty = newDigits.findIndex((d) => d === '');
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();

    submitIfComplete(newDigits);
  };

  const handleResend = () => {
    setDigits(Array(OTP_LENGTH).fill(''));
    setCountdown(RESEND_COOLDOWN);
    onResend();
    inputRefs.current[0]?.focus();
  };

  // Mask phone for display: +91 98765 ****
  const maskedPhone = phone.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 *****');

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button + heading */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800"
          aria-label="Go back to phone entry"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change number</span>
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">Check your SMS</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-neutral-900">{maskedPhone}</span>
        </p>
      </div>

      {/* OTP digit boxes */}
      <div
        className={`flex justify-between gap-2 sm:gap-3 ${shake ? 'animate-shake' : ''}`}
        role="group"
        aria-label="Enter your 6-digit OTP"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className={`otp-box ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert-error animate-fade-in" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verify button */}
      <button
        id="verify-otp-btn"
        type="button"
        disabled={isLoading || digits.some((d) => d === '')}
        onClick={() => onSubmit(digits.join(''))}
        className="btn-primary flex w-full items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>Verify OTP</span>
          </>
        )}
      </button>

      {/* Resend OTP */}
      <div className="flex items-center justify-center gap-1.5 text-sm">
        <span className="text-neutral-500">Didn&apos;t receive the code?</span>
        {countdown > 0 ? (
          <span className="text-neutral-500">
            Resend in{' '}
            <span className="tabular-nums text-primary-500">
              00:{String(countdown).padStart(2, '0')}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="flex items-center gap-1 font-medium text-primary-500 transition-colors hover:text-primary-600 disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
