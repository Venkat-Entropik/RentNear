import { apiClient } from './client';
import type { PaymentOrderResponse, PaymentPublic, VerifyPaymentInput } from '@rentnear/types';

/**
 * POST /payments/:bookingId/order
 * Create a Razorpay order for a confirmed booking.
 */
export async function createPaymentOrder(bookingId: string): Promise<PaymentOrderResponse> {
  const res = await apiClient.post<PaymentOrderResponse>(`/payments/${bookingId}/order`);
  return res.data;
}

/**
 * POST /payments/verify
 * Verify a successful Razorpay payment signature.
 */
export async function verifyPayment(input: VerifyPaymentInput): Promise<PaymentPublic> {
  const res = await apiClient.post<PaymentPublic>('/payments/verify', input);
  return res.data;
}
