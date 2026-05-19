import { IsEnum, IsString, IsUrl, IsOptional, MinLength, MaxLength } from 'class-validator';
import { DocType } from '@rentnear/types';

export class SubmitKycDto {
  @IsEnum(DocType)
  docType!: DocType;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  docNumber!: string;

  @IsUrl()
  frontUrl!: string;

  @IsOptional()
  @IsUrl()
  backUrl?: string;

  @IsOptional()
  @IsUrl()
  selfieUrl?: string;
}
