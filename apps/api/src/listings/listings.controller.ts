// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/listings/listings.controller.ts
// ──────────────────────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ConfirmMediaDto } from './dto/confirm-media.dto';
import type {
  JwtPayload,
  ListingPublic,
  ListingCategoryPublic,
  ListingsPage,
  ListingsQuery,
  PresignedUrlResponse,
} from '@rentnear/types';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ── Public routes ─────────────────────────────────────────────────────────

  /** GET /listings/categories */
  @Get('categories')
  async getCategories(): Promise<ListingCategoryPublic[]> {
    return this.listingsService.getCategories();
  }

  /** GET /listings?city=Chennai&categoryId=...&minPrice=100&page=1 */
  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<ListingsPage> {
    const q: ListingsQuery = { page, limit: Math.min(limit, 50) };
    if (city) q.city = city;
    if (categoryId) q.categoryId = categoryId;
    if (minPrice) q.minPrice = parseFloat(minPrice);
    if (maxPrice) q.maxPrice = parseFloat(maxPrice);
    return this.listingsService.findAll(q);
  }

  /** GET /listings/:id */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ListingPublic> {
    return this.listingsService.findOne(id);
  }

  // ── Protected routes ──────────────────────────────────────────────────────

  /** GET /listings/mine — owner's listings */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: JwtPayload): Promise<ListingPublic[]> {
    return this.listingsService.findMine(user.sub);
  }

  /** POST /listings — create draft */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateListingDto,
  ): Promise<ListingPublic> {
    return this.listingsService.create(user.sub, dto);
  }

  /** PATCH /listings/:id */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ): Promise<ListingPublic> {
    return this.listingsService.update(user.sub, id, dto);
  }

  /** POST /listings/:id/publish */
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<ListingPublic> {
    return this.listingsService.publish(user.sub, id);
  }

  /** DELETE /listings/:id */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    return this.listingsService.remove(user.sub, id);
  }

  // ── Media ─────────────────────────────────────────────────────────────────

  /** POST /listings/:id/media/presign — get R2 upload URL */
  @Post(':id/media/presign')
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(
    @CurrentUser() user: JwtPayload,
    @Param('id') listingId: string,
  ): Promise<PresignedUrlResponse> {
    return this.listingsService.getPresignedUrl(user.sub, listingId);
  }

  /** POST /listings/:id/media — confirm upload */
  @Post(':id/media')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async confirmMedia(
    @CurrentUser() user: JwtPayload,
    @Param('id') listingId: string,
    @Body() dto: ConfirmMediaDto,
  ): Promise<ListingPublic> {
    return this.listingsService.confirmMedia(user.sub, listingId, dto);
  }

  /** DELETE /listings/:id/media/:mediaId */
  @Delete(':id/media/:mediaId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @CurrentUser() user: JwtPayload,
    @Param('id') listingId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<void> {
    return this.listingsService.deleteMedia(user.sub, listingId, mediaId);
  }
}
