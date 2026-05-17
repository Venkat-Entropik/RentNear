import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  MinLength,
  Min,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateListingDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  pricePerDay!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  deposit?: number;

  @IsString()
  @MaxLength(80)
  city!: string;

  @IsString()
  @MaxLength(80)
  state!: string;

  @IsString()
  pincode!: string;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  lng?: number;
}
