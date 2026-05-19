// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/listings/listings.service.ts
// ──────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from './r2.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ConfirmMediaDto } from './dto/confirm-media.dto';
import type {
  ListingPublic,
  ListingCategoryPublic,
  ListingMediaPublic,
  ListingsPage,
  ListingsQuery,
  PresignedUrlResponse,
} from '@rentnear/types';

// ── Prisma include shape reused in every query ─────────────────────────────────
const LISTING_INCLUDE = {
  category: true,
  media: { orderBy: { order: 'asc' as const } },
  owner: { select: { id: true, name: true } },
} as const;

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories(): Promise<ListingCategoryPublic[]> {
    const cats = await this.prisma.listingCategory.findMany({ orderBy: { name: 'asc' } });
    return cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon }));
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(ownerId: string, dto: CreateListingDto): Promise<ListingPublic> {
    // Verify category exists
    const cat = await this.prisma.listingCategory.findUnique({ where: { id: dto.categoryId } });
    if (!cat) throw new NotFoundException('Category not found.');

    const listing = await this.prisma.listing.create({
      data: {
        ownerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        pricePerDay: new Decimal(dto.pricePerDay),
        deposit: dto.deposit !== undefined ? new Decimal(dto.deposit) : null,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,
      },
      include: LISTING_INCLUDE,
    });

    return this.mapListing(listing);
  }

  // ── Browse (public, paginated) ───────────────────────────────────────────────

  async findAll(query: ListingsQuery): Promise<ListingsPage> {
    const { city, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(categoryId && { categoryId }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            pricePerDay: {
              ...(minPrice !== undefined && { gte: new Decimal(minPrice) }),
              ...(maxPrice !== undefined && { lte: new Decimal(maxPrice) }),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        include: LISTING_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: data.map((l) => this.mapListing(l)),
      total,
      page,
      limit,
    };
  }

  // ── Owner's own listings ─────────────────────────────────────────────────────

  async findMine(ownerId: string): Promise<ListingPublic[]> {
    const listings = await this.prisma.listing.findMany({
      where: { ownerId },
      include: LISTING_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });
    return listings.map((l) => this.mapListing(l));
  }

  // ── Find one ─────────────────────────────────────────────────────────────────

  async findOne(id: string, requesterId?: string): Promise<ListingPublic> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: LISTING_INCLUDE,
    });

    if (!listing) throw new NotFoundException('Listing not found.');

    // Unpublished listings only visible to owner
    if (!listing.isPublished && listing.ownerId !== requesterId) {
      throw new NotFoundException('Listing not found.');
    }

    return this.mapListing(listing);
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  async update(ownerId: string, id: string, dto: UpdateListingDto): Promise<ListingPublic> {
    await this.assertOwner(ownerId, id);

    const listing = await this.prisma.listing.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.pricePerDay !== undefined && { pricePerDay: new Decimal(dto.pricePerDay) }),
        ...(dto.deposit !== undefined && { deposit: new Decimal(dto.deposit) }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.pincode !== undefined && { pincode: dto.pincode }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
      include: LISTING_INCLUDE,
    });

    return this.mapListing(listing);
  }

  // ── Publish ───────────────────────────────────────────────────────────────────

  async publish(ownerId: string, id: string): Promise<ListingPublic> {
    await this.assertOwner(ownerId, id);

    const mediaCount = await this.prisma.listingMedia.count({ where: { listingId: id } });
    if (mediaCount === 0) {
      throw new BadRequestException('A listing must have at least 1 photo before publishing.');
    }

    const listing = await this.prisma.listing.update({
      where: { id },
      data: { isPublished: true },
      include: LISTING_INCLUDE,
    });

    return this.mapListing(listing);
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async remove(ownerId: string, id: string): Promise<void> {
    await this.assertOwner(ownerId, id);

    // Cascade deletes media records in DB; also clean up R2
    const media = await this.prisma.listingMedia.findMany({ where: { listingId: id } });
    await Promise.all(media.map((m) => this.r2.deleteObject(m.r2Key)));

    await this.prisma.listing.delete({ where: { id } });
  }

  // ── Media: Presign ────────────────────────────────────────────────────────────

  async getPresignedUrl(ownerId: string, listingId: string): Promise<PresignedUrlResponse> {
    await this.assertOwner(ownerId, listingId);
    return this.r2.getPresignedPutUrl(`listings/${listingId}`);
  }

  // ── Media: Confirm ────────────────────────────────────────────────────────────

  async confirmMedia(
    ownerId: string,
    listingId: string,
    dto: ConfirmMediaDto,
  ): Promise<ListingPublic> {
    await this.assertOwner(ownerId, listingId);

    const isPrimary = dto.isPrimary ?? false;

    // If this is set as primary, unset others
    if (isPrimary) {
      await this.prisma.listingMedia.updateMany({
        where: { listingId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    await this.prisma.listingMedia.create({
      data: {
        listingId,
        url: dto.url,
        r2Key: dto.r2Key,
        order: dto.order ?? 0,
        isPrimary,
      },
    });

    const listing = await this.prisma.listing.findUniqueOrThrow({
      where: { id: listingId },
      include: LISTING_INCLUDE,
    });

    return this.mapListing(listing);
  }

  // ── Media: Delete ─────────────────────────────────────────────────────────────

  async deleteMedia(ownerId: string, listingId: string, mediaId: string): Promise<void> {
    await this.assertOwner(ownerId, listingId);

    const media = await this.prisma.listingMedia.findFirst({
      where: { id: mediaId, listingId },
    });

    if (!media) throw new NotFoundException('Media not found.');

    await this.prisma.listingMedia.delete({ where: { id: mediaId } });
    await this.r2.deleteObject(media.r2Key);
  }

  // ── Private helpers ────────────────────────────────────────────────────────────

  private async assertOwner(ownerId: string, listingId: string): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true },
    });

    if (!listing) throw new NotFoundException('Listing not found.');
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this listing.');
    }
  }

  private mapListing(listing: {
    id: string;
    ownerId: string;
    owner: { id: string; name: string | null };
    category: { id: string; name: string; icon: string | null };
    title: string;
    description: string;
    pricePerDay: Decimal;
    deposit: Decimal | null;
    isPublished: boolean;
    city: string;
    state: string;
    pincode: string;
    lat: number | null;
    lng: number | null;
    media: Array<{ id: string; url: string; order: number; isPrimary: boolean }>;
    rating: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): ListingPublic {
    return {
      id: listing.id,
      ownerId: listing.ownerId,
      ownerName: listing.owner.name,
      category: listing.category,
      title: listing.title,
      description: listing.description,
      pricePerDay: listing.pricePerDay.toNumber(),
      deposit: listing.deposit?.toNumber() ?? null,
      isPublished: listing.isPublished,
      city: listing.city,
      state: listing.state,
      pincode: listing.pincode,
      lat: listing.lat,
      lng: listing.lng,
      media: listing.media.map((m) => this.mapMedia(m)),
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    };
  }

  private mapMedia(m: {
    id: string;
    url: string;
    order: number;
    isPrimary: boolean;
  }): ListingMediaPublic {
    return { id: m.id, url: m.url, order: m.order, isPrimary: m.isPrimary };
  }
}
