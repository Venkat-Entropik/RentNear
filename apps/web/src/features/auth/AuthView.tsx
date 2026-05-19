'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/AuthView.tsx
//
// Client component that orchestrates the auth flow state machine.
// This is the component that the page.tsx renders.
// ──────────────────────────────────────────────────────────────────────────────

import { useAuthStore } from './store/authStore';
import { useSendOtp, useVerifyOtp } from './hooks/useAuth';
import { AuthCard } from './components/AuthCard';
import { PhoneInput } from './components/PhoneInput';
import { OtpInput } from './components/OtpInput';
import { SuccessScreen } from './components/SuccessScreen';

/**
 * Normalises API error messages from the axios client into a user-readable string.
 */
function extractErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: string | string[] }).message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return 'Something went wrong. Please try again.';
}

export function AuthView() {
  const { step, pendingPhone, user, setStep } = useAuthStore();

  // ── Mutations ────────────────────────────────────────────────────────────
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSendOtp = (phone: string) => {
    sendOtpMutation.mutate(phone);
  };

  const handleVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate(otp);
  };

  const handleResendOtp = () => {
    if (pendingPhone) {
      sendOtpMutation.mutate(pendingPhone);
    }
  };

  const handleBack = () => {
    setStep('phone');
    sendOtpMutation.reset();
    verifyOtpMutation.reset();
  };

  return (
    <AuthCard>
      {/* ── Step 1: Phone Entry ─────────────────────────────────────────── */}
      {step === 'phone' && (
        <PhoneInput
          onSubmit={handleSendOtp}
          onSuccess={() => {}} // Handled internally by useSendOtp via Zustand
          isLoading={sendOtpMutation.isPending}
          error={extractErrorMessage(sendOtpMutation.error)}
        />
      )}

      {/* ── Step 2: OTP Verification ────────────────────────────────────── */}
      {step === 'otp' && pendingPhone && (
        <OtpInput
          phone={pendingPhone}
          onSubmit={handleVerifyOtp}
          onResend={handleResendOtp}
          onBack={handleBack}
          isLoading={verifyOtpMutation.isPending}
          isResending={sendOtpMutation.isPending}
          error={extractErrorMessage(verifyOtpMutation.error)}
        />
      )}

      {/* ── Step 3: Success ─────────────────────────────────────────────── */}
      {step === 'success' && user && <SuccessScreen user={user} />}
    </AuthCard>
  );
}
