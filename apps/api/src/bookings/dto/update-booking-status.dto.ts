import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '@rentnear/types';
import type { UpdateBookingStatusInput } from '@rentnear/types';

export class UpdateBookingStatusDto implements UpdateBookingStatusInput {
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
