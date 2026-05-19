import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import type { CreateReviewInput } from '@rentnear/types';

export class CreateReviewDto implements CreateReviewInput {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsNotEmpty()
  comment!: string;
}
