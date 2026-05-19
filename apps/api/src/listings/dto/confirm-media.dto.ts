import { IsString, IsUrl, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmMediaDto {
  @IsString()
  r2Key!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
