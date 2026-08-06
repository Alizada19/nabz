import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { GeoService } from '../common/services/geo.service';
import { BloodCompatibilityService } from './blood-compatibility.service';
import { MatchedDonorDto } from './dto/matched-donor.dto';
import * as bcrypt from 'bcrypt';

export interface MatchDonorsParams {
  requiredBloodType: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface InternalMatchedDonor extends MatchedDonorDto {
  userId: string; // kept internally only, e.g. for sending notifications
}

@Injectable()
export class DonorMatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
    private readonly compatibilityService: BloodCompatibilityService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Core matching workflow:
   *  1. Resolve compatible donor blood types for the requirement.
   *  2. Load available donors of those blood types who have a known location.
   *  3. Compute Haversine distance for each and filter by radius.
   *  4. Sort by nearest first.
   *
   * Returns donor data shaped for external consumption (no exact coordinates,
   * no phone numbers) plus an internal userId used for notification routing.
   */
  async findMatchingDonors(
    params: MatchDonorsParams,
  ): Promise<{ items: InternalMatchedDonor[]; total: number }> {
    const radiusKm =
      params.radiusKm ?? this.config.get<number>('matching.defaultRadiusKm') ?? 50;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const compatibleTypes = this.compatibilityService.getCompatibleDonorTypes(
      params.requiredBloodType,
    );

    const candidateProfiles = await this.prisma.donorProfile.findMany({
      where: {
        availableStatus: true,
        bloodType: { name: { in: compatibleTypes } },
        user: {
          isAvailable: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      include: {
        user: true,
        bloodType: true,
      },
    });

    const origin = { latitude: params.latitude, longitude: params.longitude };

    const withDistance: InternalMatchedDonor[] = candidateProfiles
      .map((profile) => {
        const distanceKm = this.geoService.calculateDistanceKm(origin, {
          latitude: profile.user.latitude as number,
          longitude: profile.user.longitude as number,
        });
        return {
          userId: profile.userId,
          distanceKm,
          city: profile.user.location,
          availability: profile.availableStatus,
          bloodType: profile.bloodType.name,
          displayName: this.toDisplayName(profile.user.name),
        };
      })
      .filter((donor) => donor.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const total = withDistance.length;
    const start = (page - 1) * limit;
    const items = withDistance.slice(start, start + limit);

    return { items, total };
  }

  /**
   * Masks a donor's full name into a privacy-preserving display name,
   * e.g. "Ahmad Zulkifli" -> "Ahmad Z."
   */
  private toDisplayName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${first} ${lastInitial}.`;
  }

  // --- CRUD Donors Management Methods ---

  async registerDonor(dto: any) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phone: dto.phone },
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Donor with this email or phone already exists');
    }

    const bloodType = await this.prisma.bloodType.findUnique({
      where: { name: dto.bloodType },
    });
    if (!bloodType) {
      throw new NotFoundException(`Blood type ${dto.bloodType} not found`);
    }

    const passwordHash = await bcrypt.hash(dto.password || 'Donor@12345', 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: passwordHash,
        role: 'donor',
        location: dto.location || null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
      },
    });

    const donorProfile = await this.prisma.donorProfile.create({
      data: {
        userId: user.id,
        bloodTypeId: bloodType.id,
        lastDonationDate: dto.lastDonationDate ? new Date(dto.lastDonationDate) : null,
        availableStatus: dto.availableStatus !== undefined ? dto.availableStatus : true,
      },
      include: { bloodType: true },
    });

    return {
      ...user,
      donorProfile,
    };
  }

  async findDonorById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: 'donor' },
      include: {
        donorProfile: {
          include: { bloodType: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Donor not found');
    }
    return user;
  }

  async updateDonor(id: string, dto: any) {
    const user = await this.findDonorById(id);

    let bloodTypeId = user.donorProfile?.bloodTypeId;
    if (dto.bloodType) {
      const bt = await this.prisma.bloodType.findUnique({
        where: { name: dto.bloodType },
      });
      if (bt) {
        bloodTypeId = bt.id;
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        email: dto.email !== undefined ? dto.email : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        location: dto.location !== undefined ? dto.location : undefined,
        latitude: dto.latitude !== undefined ? dto.latitude : undefined,
        longitude: dto.longitude !== undefined ? dto.longitude : undefined,
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
      },
    });

    const updatedProfile = await this.prisma.donorProfile.update({
      where: { userId: id },
      data: {
        bloodTypeId,
        lastDonationDate: dto.lastDonationDate !== undefined ? (dto.lastDonationDate ? new Date(dto.lastDonationDate) : null) : undefined,
        availableStatus: dto.availableStatus !== undefined ? dto.availableStatus : undefined,
      },
      include: { bloodType: true },
    });

    return {
      ...updatedUser,
      donorProfile: updatedProfile,
    };
  }

  async deleteDonor(id: string) {
    await this.findDonorById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async listDonors(query: any) {
    const { page = 1, limit = 10, bloodType, availability, eligibility, location, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      role: 'donor',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const donorProfileWhere: any = {};
    let hasDonorProfileFilter = false;

    if (bloodType) {
      donorProfileWhere.bloodType = {
        name: { equals: bloodType, mode: 'insensitive' },
      };
      hasDonorProfileFilter = true;
    }

    if (availability !== undefined && availability !== '') {
      const isAvail = availability === 'true' || availability === true;
      donorProfileWhere.availableStatus = isAvail;
      hasDonorProfileFilter = true;
    }

    if (eligibility) {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - 56);

      if (eligibility === 'eligible') {
        donorProfileWhere.OR = [
          { lastDonationDate: null },
          { lastDonationDate: { lte: threshold } },
        ];
      } else if (eligibility === 'ineligible') {
        donorProfileWhere.lastDonationDate = { gt: threshold };
      }
      hasDonorProfileFilter = true;
    }

    if (hasDonorProfileFilter) {
      where.donorProfile = donorProfileWhere;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          donorProfile: {
            include: { bloodType: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}
