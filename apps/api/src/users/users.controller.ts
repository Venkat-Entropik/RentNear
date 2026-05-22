// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/users/users.controller.ts
// ──────────────────────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import type { JwtPayload } from '@rentnear/types';
import type { UserProfile, AddressPublic, KycDocumentPublic } from '@rentnear/types';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Profile ───────────────────────────────────────────────────────────────

  /** GET /users/me — full profile with addresses + KYC */
  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserProfile> {
    return this.usersService.getMe(user.sub);
  }

  /** PATCH /users/me — update name, email, or avatarUrl */
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  // ── Addresses ─────────────────────────────────────────────────────────────

  /** GET /users/me/addresses */
  @Get('me/addresses')
  async getAddresses(@CurrentUser() user: JwtPayload): Promise<AddressPublic[]> {
    return this.usersService.getAddresses(user.sub);
  }

  /** POST /users/me/addresses */
  @Post('me/addresses')
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressPublic> {
    return this.usersService.createAddress(user.sub, dto);
  }

  /** DELETE /users/me/addresses/:id */
  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') addressId: string,
  ): Promise<void> {
    return this.usersService.deleteAddress(user.sub, addressId);
  }

  // ── KYC ───────────────────────────────────────────────────────────────────

  /** POST /users/me/kyc — submit or resubmit KYC documents */
  @Post('me/kyc')
  @HttpCode(HttpStatus.CREATED)
  async submitKyc(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitKycDto,
  ): Promise<KycDocumentPublic> {
    return this.usersService.submitKyc(user.sub, dto);
  }

  /** GET /users/me/kyc — get current KYC status */
  @Get('me/kyc')
  async getKycStatus(@CurrentUser() user: JwtPayload): Promise<KycDocumentPublic | null> {
    return this.usersService.getKycStatus(user.sub);
  }
}
