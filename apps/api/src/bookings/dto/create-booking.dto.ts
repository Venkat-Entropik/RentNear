import { IsDateString, IsNotEmpty } from 'class-validator';
import type { CreateBookingInput } from '@rentnear/types';

export class CreateBookingDto implements CreateBookingInput {
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
