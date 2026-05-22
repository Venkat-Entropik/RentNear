import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import type { DisputePublic } from '@rentnear/types';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  private formatDispute(dispute: any): DisputePublic {
    return {
      id: dispute.id,
      bookingId: dispute.bookingId,
      initiatorId: dispute.initiatorId,
      reason: dispute.reason,
      status: dispute.status as any,
      adminNotes: dispute.adminNotes,
      createdAt: dispute.createdAt.toISOString(),
      updatedAt: dispute.updatedAt.toISOString(),
      booking: dispute.booking
        ? {
            id: dispute.booking.id,
            status: dispute.booking.status as string,
            ...(dispute.booking.listing
              ? {
                  listing: {
                    id: dispute.booking.listing.id,
                    title: dispute.booking.listing.title,
                    media: dispute.booking.listing.media || [],
                  },
                }
              : {}),
          }
        : undefined,
      initiator: dispute.initiator
        ? {
            id: dispute.initiator.id,
            name: dispute.initiator.name,
            email: dispute.initiator.email,
          }
        : undefined,
    } as DisputePublic;
  }

  async create(userId: string, dto: CreateDisputeDto): Promise<DisputePublic> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { listing: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // Only renter or owner can dispute
    if (booking.renterId !== userId && booking.listing.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to dispute this booking');
    }

    // Only allow disputes on non-pending, non-cancelled bookings
    if (['PENDING', 'CANCELLED'].includes(booking.status)) {
      throw new BadRequestException(`Cannot dispute a booking in ${booking.status} state`);
    }

    // Check if already disputed
    const existing = await this.prisma.dispute.findFirst({
      where: { bookingId: dto.bookingId, initiatorId: userId },
    });

    if (existing) {
      throw new BadRequestException('You have already opened a dispute for this booking');
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        bookingId: dto.bookingId,
        initiatorId: userId,
        reason: dto.reason,
      },
      include: {
        booking: { include: { listing: { include: { media: { take: 1 } } } } },
        initiator: true,
      },
    });

    return this.formatDispute(dispute);
  }

  async getUserDisputes(userId: string): Promise<DisputePublic[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          // Include disputes against them (where they are renter or owner but not initiator)
          { booking: { renterId: userId } },
          { booking: { listing: { ownerId: userId } } },
        ],
      },
      include: {
        booking: { include: { listing: { include: { media: { take: 1 } } } } },
        initiator: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return disputes.map((d) => this.formatDispute(d));
  }
}
