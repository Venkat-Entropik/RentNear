import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import type { ReviewPublic, ReviewsPage } from '@rentnear/types';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private formatReview(review: any): ReviewPublic {
    const formatted: ReviewPublic = {
      id: review.id,
      listingId: review.listingId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };

    if (review.user) {
      formatted.user = {
        id: review.user.id,
        name: review.user.name,
        avatarUrl: review.user.avatarUrl,
      };
    }

    return formatted;
  }

  async createReview(
    userId: string,
    listingId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewPublic> {
    // 1. Verify user has a COMPLETED booking for this listing
    const completedBooking = await this.prisma.booking.findFirst({
      where: {
        listingId,
        renterId: userId,
        status: 'COMPLETED',
      },
    });

    if (!completedBooking) {
      throw new BadRequestException(
        'You can only review listings you have successfully rented and completed.',
      );
    }

    // 2. Ensure they haven't already reviewed it
    const existingReview = await this.prisma.review.findUnique({
      where: {
        listingId_userId: { listingId, userId },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this listing.');
    }

    // 3. Create review & update aggregate on Listing transactionally
    const review = await this.prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          listingId,
          userId,
          rating: dto.rating,
          comment: dto.comment,
        },
        include: { user: true },
      });

      // Calculate new aggregates
      const agg = await tx.review.aggregate({
        where: { listingId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newRating = agg._avg.rating || 0;
      const newCount = agg._count.id || 0;

      // Update Listing
      await tx.listing.update({
        where: { id: listingId },
        data: {
          rating: newRating,
          reviewCount: newCount,
        },
      });

      return newReview;
    });

    return this.formatReview(review);
  }

  async getListingReviews(listingId: string, page = 1, limit = 10): Promise<ReviewsPage> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { listingId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { listingId } }),
    ]);

    return {
      data: reviews.map((r) => this.formatReview(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
