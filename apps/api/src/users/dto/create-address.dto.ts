import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Length,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(40)
  label!: string; // "Home" | "Work" | "Other"

  @IsString()
  @MaxLength(200)
  street!: string;

  @IsString()
  @MaxLength(80)
  city!: string;

  @IsString()
  @MaxLength(80)
  state!: string;

  @IsString()
  @Length(6, 6)
  pincode!: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
