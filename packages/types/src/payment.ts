export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentPublic {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  razorpayOrderId?: string | null;
  status: PaymentStatus;
  createdAt: string; // ISO string
}

export interface VerifyPaymentInput {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface PaymentOrderResponse {
  paymentId: string; // Our internal payment ID
  razorpayOrderId: string;
  amount: number;
  currency: string;
}
