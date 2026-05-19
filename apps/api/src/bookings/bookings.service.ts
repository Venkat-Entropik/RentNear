import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, type BookingPublic } from '@rentnear/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format Prisma booking to BookingPublic
   */
  private formatBooking(booking: any): BookingPublic {
    const formatted: BookingPublic = {
      id: booking.id,
      listingId: booking.listingId,
      renterId: booking.renterId,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalPrice: Number(booking.totalPrice),
      status: booking.status as BookingStatus,
      createdAt: booking.createdAt.toISOString(),
    };

    if (booking.listing) {
      formatted.listing = {
        id: booking.listing.id,
        title: booking.listing.title,
        pricePerDay: Number(booking.listing.pricePerDay),
        city: booking.listing.city,
        ownerId: booking.listing.ownerId,
        media: booking.listing.media || [],
      };
    }

    if (booking.renter) {
      formatted.renter = {
        id: booking.renter.id,
        name: booking.renter.name,
        avatarUrl: booking.renter.avatarUrl,
      };
    }

    return formatted;
  }

  /**
   * Create a new booking request.
   */
  async create(renterId: string, listingId: string, dto: CreateBookingDto): Promise<BookingPublic> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    
    // Validations
    if (start > end) throw new BadRequestException('Start date must be before or equal to end date.');
    if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Start date cannot be in the past.');
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId, isPublished: true },
    });

    if (!listing) throw new NotFoundException('Listing not found or not published.');
    if (listing.ownerId === renterId) throw new BadRequestException('You cannot book your own listing.');

    // Calculate days and total price
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
    const totalPrice = Number(listing.pricePerDay) * days;

    // Check availability
    // We fetch any existing blocked dates within this range for the listing.
    const blockedDates = await this.prisma.availability.findMany({
      where: {
        listingId,
        date: { gte: start, lte: end },
        isBlocked: true,
      },
    });

    if (blockedDates.length > 0) {
      throw new BadRequestException('The listing is not available for the selected dates.');
    }

    // Wrap in a transaction to block dates immediately
    const booking = await this.prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          listingId,
          renterId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: 'PENDING',
        },
        include: { listing: { include: { media: true } }, renter: true },
      });

      // Block dates
      const datesToBlock: Prisma.AvailabilityCreateManyInput[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesToBlock.push({
          listingId,
          date: new Date(d),
          isBlocked: true,
        });
      }

      // Upsert availability
      for (const av of datesToBlock) {
        await tx.availability.upsert({
          where: {
            listingId_date: {
              listingId: av.listingId,
              date: av.date,
            },
          },
          update: { isBlocked: true },
          create: {
            listingId: av.listingId,
            date: av.date,
            isBlocked: true,
          },
        });
      }

      return b;
    });

    return this.formatBooking(booking);
  }

  /**
   * Get trips for a renter
   */
  async getMyTrips(renterId: string): Promise<BookingPublic[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { renterId },
      include: {
        listing: {
          include: {
            media: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(b => this.formatBooking(b));
  }

  /**
   * Get incoming booking requests for an owner
   */
  async getOwnerRequests(ownerId: string): Promise<BookingPublic[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        listing: { ownerId },
      },
      include: {
        listing: {
          include: {
            media: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        renter: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(b => this.formatBooking(b));
  }

  /**
   * Update the status of a booking (CONFIRM/REJECT/CANCEL)
   */
  async updateStatus(userId: string, bookingId: string, status: BookingStatus): Promise<BookingPublic> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    const isOwner = booking.listing.ownerId === userId;
    const isRenter = booking.renterId === userId;

    if (!isOwner && !isRenter) {
      throw new ForbiddenException('Not authorized to access this booking.');
    }

    // Owner can CONFIRM or REJECT a PENDING booking
    if (isOwner) {
      if (!['CONFIRMED', 'REJECTED'].includes(status)) {
        throw new BadRequestException('Owner can only CONFIRM or REJECT bookings.');
      }
      if (booking.status !== 'PENDING') {
        throw new BadRequestException(`Cannot transition from ${booking.status} to ${status}.`);
      }
    }

    // Renter can CANCEL a PENDING or CONFIRMED booking
    if (isRenter) {
      if (status !== 'CANCELLED') {
        throw new BadRequestException('Renter can only CANCEL bookings.');
      }
      if (['REJECTED', 'COMPLETED', 'CANCELLED'].includes(booking.status)) {
        throw new BadRequestException('Booking cannot be cancelled at this stage.');
      }
    }

    // Perform the update
    const updated = await this.prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status },
        include: { listing: { include: { media: true } }, renter: true },
      });

      // If REJECTED or CANCELLED, free up the availability
      if (['REJECTED', 'CANCELLED'].includes(status)) {
        await tx.availability.updateMany({
          where: {
            listingId: booking.listingId,
            date: { gte: booking.startDate, lte: booking.endDate },
          },
          data: { isBlocked: false },
        });
      }

      return b;
    });

    return this.formatBooking(updated);
  }
}
