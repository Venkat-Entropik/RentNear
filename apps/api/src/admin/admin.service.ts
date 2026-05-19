import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalListings, totalBookings, totalPayments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count(),
      this.prisma.booking.count(),
      this.prisma.payment.count({ where: { status: 'SUCCESS' } }),
    ]);

    // Calculate total revenue (this is just the sum of all successful payments)
    const aggregate = await this.prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });
    const totalRevenue = aggregate._sum.amount?.toNumber() || 0;

    return {
      totalUsers,
      totalListings,
      totalBookings,
      totalPayments,
      totalRevenue,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getListings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          owner: { select: { name: true, email: true } },
          category: { select: { name: true } },
        },
      }),
      this.prisma.listing.count(),
    ]);

    return {
      data: listings.map((l) => ({
        id: l.id,
        title: l.title,
        pricePerDay: l.pricePerDay.toNumber(),
        isPublished: l.isPublished,
        ownerName: l.owner?.name || 'Unknown',
        categoryName: l.category?.name || 'Unknown',
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  
  // Temporary method to promote a user to admin for testing
  async promoteToAdmin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
  }

  async getDisputes(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        orderBy: [
          { status: 'asc' }, // OPEN first
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          booking: { include: { listing: { select: { id: true, title: true } } } },
          initiator: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.dispute.count(),
    ]);

    return {
      data: disputes.map((d) => ({
        id: d.id,
        bookingId: d.bookingId,
        initiatorId: d.initiatorId,
        reason: d.reason,
        status: d.status,
        adminNotes: d.adminNotes,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        booking: d.booking ? {
          id: d.booking.id,
          status: d.booking.status,
          ...(d.booking.listing ? { listing: d.booking.listing } : {}),
        } : undefined,
        initiator: d.initiator,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateDispute(id: string, data: { status: any; adminNotes?: string }) {
    const dispute = await this.prisma.dispute.update({
      where: { id },
      data,
      include: {
        booking: { include: { listing: { select: { id: true, title: true } } } },
        initiator: { select: { id: true, name: true, email: true } },
      },
    });

    return {
        id: dispute.id,
        bookingId: dispute.bookingId,
        initiatorId: dispute.initiatorId,
        reason: dispute.reason,
        status: dispute.status,
        adminNotes: dispute.adminNotes,
        createdAt: dispute.createdAt.toISOString(),
        updatedAt: dispute.updatedAt.toISOString(),
        booking: dispute.booking ? {
          id: dispute.booking.id,
          status: dispute.booking.status,
          ...(dispute.booking.listing ? { listing: dispute.booking.listing } : {}),
        } : undefined,
        initiator: dispute.initiator,
    };
  }
}
