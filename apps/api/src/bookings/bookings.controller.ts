import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import type { JwtPayload, BookingPublic } from '@rentnear/types';

@UseGuards(JwtAuthGuard)
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** Create a booking request for a listing */
  @Post('listings/:id/bookings')
  createBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') listingId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingPublic> {
    return this.bookingsService.create(user.sub, listingId, dto);
  }

  /** Get all bookings (trips) made by the current user (renter) */
  @Get('bookings/trips')
  getMyTrips(@CurrentUser() user: JwtPayload): Promise<BookingPublic[]> {
    return this.bookingsService.getMyTrips(user.sub);
  }

  /** Get all incoming booking requests for the current user's listings (owner) */
  @Get('bookings/requests')
  getOwnerRequests(@CurrentUser() user: JwtPayload): Promise<BookingPublic[]> {
    return this.bookingsService.getOwnerRequests(user.sub);
  }

  /** Update booking status (owner confirms/rejects, renter cancels) */
  @Patch('bookings/:id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingPublic> {
    return this.bookingsService.updateStatus(user.sub, bookingId, dto.status);
  }
}
