import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentStatus, BookingStatus } from '@rentnear/types';
import type { PaymentOrderResponse, PaymentPublic } from '@rentnear/types';
import * as crypto from 'crypto';

// Use require since Razorpay might not have ES module exports or types properly mapped
const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
  private razorpay;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const key_id = this.config.get<string>('RAZORPAY_KEY_ID');
    const key_secret = this.config.get<string>('RAZORPAY_KEY_SECRET');

    if (key_id && key_secret) {
      this.razorpay = new Razorpay({
        key_id,
        key_secret,
      });
    } else {
      console.warn(
        'Razorpay keys not found in environment variables. Payment integration will fail.',
      );
    }
  }

  private formatPayment(payment: any): PaymentPublic {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      userId: payment.userId,
      amount: Number(payment.amount),
      razorpayOrderId: payment.razorpayOrderId,
      status: payment.status as PaymentStatus,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  /**
   * Create a Razorpay Order and corresponding Payment record
   */
  async createOrder(userId: string, bookingId: string): Promise<PaymentOrderResponse> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured on the server.');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.renterId !== userId) {
      throw new ForbiddenException('Not authorized to pay for this booking.');
    }
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException(`Cannot pay for a booking with status: ${booking.status}.`);
    }
    if (booking.payment && booking.payment.status === 'SUCCESS') {
      throw new BadRequestException('This booking has already been paid for.');
    }

    // Convert amount to paise (smallest currency unit for INR)
    const amountInPaise = Math.round(Number(booking.totalPrice) * 100);

    // Create Razorpay Order
    let order;
    try {
      order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${booking.id}`,
      });
    } catch (error: any) {
      console.error('Razorpay Order creation failed:', error);
      throw new InternalServerErrorException('Failed to create payment order with the gateway.');
    }

    // Upsert Payment record
    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      update: {
        amount: booking.totalPrice,
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
      create: {
        bookingId,
        userId,
        amount: booking.totalPrice,
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
    });

    return {
      paymentId: payment.id,
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  /**
   * Verify the Razorpay payment signature
   */
  async verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<PaymentPublic> {
    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId: dto.razorpayOrderId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found.');
    }
    if (payment.userId !== userId) {
      throw new ForbiddenException('Not authorized to verify this payment.');
    }

    // Verify signature
    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('Razorpay secret not configured.');
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(dto.razorpayOrderId + '|' + dto.razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== dto.razorpaySignature) {
      // Signature mismatch
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException('Invalid payment signature. Payment failed.');
    }

    // Signature matches, update payment and booking status
    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature,
        },
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'COMPLETED' }, // Or whatever 'Paid' state we want
      });

      return p;
    });

    return this.formatPayment(updatedPayment);
  }
}
