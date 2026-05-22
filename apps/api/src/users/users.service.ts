// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/users/users.service.ts
// ──────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import type { UserProfile, AddressPublic, KycDocumentPublic } from '@rentnear/types';
import { KycStatus } from '@rentnear/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Get full profile (with addresses + KYC) ────────────────────────────────
  async getMe(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        kycDocument: true,
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    return this.mapToProfile(user);
  }

  // ── Update profile fields ──────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    // Guard: email uniqueness (if changing email)
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Email is already in use.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        kycDocument: true,
      },
    });

    return this.mapToProfile(user);
  }

  // ── Address Book ───────────────────────────────────────────────────────────

  async getAddresses(userId: string): Promise<AddressPublic[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
    return addresses.map(this.mapAddress);
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressPublic> {
    // If this is the user's first address OR explicitly set as default, set isDefault
    const existingCount = await this.prisma.address.count({ where: { userId } });
    const shouldBeDefault = existingCount === 0 || dto.isDefault === true;

    // Clear other defaults if this one is taking over
    if (shouldBeDefault && existingCount > 0) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        label: dto.label,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,
        isDefault: shouldBeDefault,
      },
    });

    return this.mapAddress(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException('Address not found.');

    // Prevent deleting the default if other addresses exist
    if (address.isDefault) {
      const count = await this.prisma.address.count({ where: { userId } });
      if (count > 1) {
        throw new BadRequestException(
          'Cannot delete default address while other addresses exist. Set a new default first.',
        );
      }
    }

    await this.prisma.address.delete({ where: { id: addressId } });
  }

  // ── KYC ───────────────────────────────────────────────────────────────────

  async submitKyc(userId: string, dto: SubmitKycDto): Promise<KycDocumentPublic> {
    // Upsert — user can resubmit (e.g., after rejection with corrected doc)
    const existing = await this.prisma.kycDocument.findUnique({ where: { userId } });

    if (existing?.status === KycStatus.VERIFIED) {
      throw new ConflictException('KYC is already verified. No changes allowed.');
    }

    const doc = await this.prisma.kycDocument.upsert({
      where: { userId },
      create: {
        userId,
        docType: dto.docType,
        docNumber: dto.docNumber,
        frontUrl: dto.frontUrl,
        backUrl: dto.backUrl ?? null,
        selfieUrl: dto.selfieUrl ?? null,
        status: KycStatus.PENDING,
      },
      update: {
        docType: dto.docType,
        docNumber: dto.docNumber,
        frontUrl: dto.frontUrl,
        backUrl: dto.backUrl ?? null,
        selfieUrl: dto.selfieUrl ?? null,
        status: KycStatus.PENDING,
        reviewNote: null,
        submittedAt: new Date(),
        reviewedAt: null,
      },
    });

    // Mirror PENDING status on the User record
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: KycStatus.PENDING },
    });

    return this.mapKycDocument(doc);
  }

  async getKycStatus(userId: string): Promise<KycDocumentPublic | null> {
    const doc = await this.prisma.kycDocument.findUnique({ where: { userId } });
    return doc ? this.mapKycDocument(doc) : null;
  }

  // ── Private Mappers ────────────────────────────────────────────────────────

  private mapToProfile(user: {
    id: string;
    phone: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    kycStatus: string;
    createdAt: Date;
    addresses: Array<{
      id: string;
      label: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
      lat: number | null;
      lng: number | null;
      isDefault: boolean;
    }>;
    kycDocument: {
      id: string;
      docType: string;
      docNumber: string;
      frontUrl: string;
      backUrl: string | null;
      selfieUrl: string | null;
      status: string;
      reviewNote: string | null;
      submittedAt: Date;
      reviewedAt: Date | null;
    } | null;
  }): UserProfile {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role as UserProfile['role'],
      kycStatus: user.kycStatus as UserProfile['kycStatus'],
      createdAt: user.createdAt.toISOString(),
      addresses: user.addresses.map(this.mapAddress),
      kycDocument: user.kycDocument ? this.mapKycDocument(user.kycDocument) : null,
    };
  }

  private mapAddress(a: {
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    lat: number | null;
    lng: number | null;
    isDefault: boolean;
  }): AddressPublic {
    return {
      id: a.id,
      label: a.label,
      street: a.street,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      lat: a.lat,
      lng: a.lng,
      isDefault: a.isDefault,
    };
  }

  private mapKycDocument(doc: {
    id: string;
    docType: string;
    docNumber: string;
    frontUrl: string;
    backUrl: string | null;
    selfieUrl: string | null;
    status: string;
    reviewNote: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
  }): KycDocumentPublic {
    return {
      id: doc.id,
      docType: doc.docType as KycDocumentPublic['docType'],
      docNumber: doc.docNumber,
      frontUrl: doc.frontUrl,
      backUrl: doc.backUrl,
      selfieUrl: doc.selfieUrl,
      status: doc.status as KycDocumentPublic['status'],
      reviewNote: doc.reviewNote,
      submittedAt: doc.submittedAt.toISOString(),
      reviewedAt: doc.reviewedAt?.toISOString() ?? null,
    };
  }
}
