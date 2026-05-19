import { Controller, Post, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import type { JwtPayload, PaymentOrderResponse, PaymentPublic } from '@rentnear/types';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a Razorpay order for a confirmed booking
   */
  @Post(':bookingId/order')
  @HttpCode(HttpStatus.CREATED)
  createOrder(
    @CurrentUser() user: JwtPayload,
    @Param('bookingId') bookingId: string,
  ): Promise<PaymentOrderResponse> {
    return this.paymentsService.createOrder(user.sub, bookingId);
  }

  /**
   * Verify the payment from the frontend
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyPayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyPaymentDto,
  ): Promise<PaymentPublic> {
    return this.paymentsService.verifyPayment(user.sub, dto);
  }
}
