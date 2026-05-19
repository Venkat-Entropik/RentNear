import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason!: string;
}
