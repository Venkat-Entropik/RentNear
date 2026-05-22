import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import type { JwtPayload, ReviewPublic, ReviewsPage } from '@rentnear/types';

@Controller('listings/:id/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createReview(
    @CurrentUser() user: JwtPayload,
    @Param('id') listingId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewPublic> {
    return this.reviewsService.createReview(user.sub, listingId, dto);
  }

  @Get()
  getReviews(
    @Param('id') listingId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<ReviewsPage> {
    return this.reviewsService.getListingReviews(listingId, page, limit);
  }
}
