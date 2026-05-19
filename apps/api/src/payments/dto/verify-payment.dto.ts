import { IsNotEmpty, IsString } from 'class-validator';
import type { VerifyPaymentInput } from '@rentnear/types';

export class VerifyPaymentDto implements VerifyPaymentInput {
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId!: string;

  @IsNotEmpty()
  @IsString()
  razorpayOrderId!: string;

  @IsNotEmpty()
  @IsString()
  razorpaySignature!: string;
}
