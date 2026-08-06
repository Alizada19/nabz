import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BloodTypesService } from '../blood-types/blood-types.service';
import { CreateDonorProfileDto } from './dto/create-donor-profile.dto';
import { UpdateDonorProfileDto } from './dto/update-donor-profile.dto';
import { QueryDonorsDto } from './dto/query-donors.dto';
import { CreateDonorAdminDto } from './dto/create-donor-admin.dto';
import { UpdateDonorAdminDto } from './dto/update-donor-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DonorProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bloodTypesService: BloodTypesService,
  ) {}

  async createForUser(userId: string, userRole: Role, dto: CreateDonorProfileDto) {
    if (userRole !== Role.donor) {
      throw new ForbiddenException('Only donors can create a donor profile');
    }

    const existing = await this.prisma.donorProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Donor profile already exists for this user');
    }

    const bloodType = await this.bloodTypesService.findByName(dto.bloodType);

    return this.prisma.donorProfile.create({
      data: { userId, bloodTypeId: bloodType.id },
      include: { bloodType: true },
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.donorProfile.findUnique({
      where: { userId },
      include: { bloodType: true },
    });
    if (!profile) {
      throw new NotFoundException('Donor profile not found');
    }
    return profile;
  }

  async update(userId: string, dto: UpdateDonorProfileDto) {
    const profile = await this.findByUserId(userId);

    let bloodTypeId = profile.bloodTypeId;
    if (dto.bloodType) {
      const bloodType = await this.bloodTypesService.findByName(dto.bloodType);
      bloodTypeId = bloodType.id;
    }

    if (dto.lastDonationDate && new Date(dto.lastDonationDate) > new Date()) {
      throw new BadRequestException('lastDonationDate cannot be in the future');
    }

    return this.prisma.donorProfile.update({
      where: { userId },
      data: {
        bloodTypeId,
        availableStatus: dto.availableStatus,
        lastDonationDate: dto.lastDonationDate
          ? new Date(dto.lastDonationDate)
          : undefined,
      },
      include: { bloodType: true },
    });
  }

  /**
   * Updates a donor's live location. Used when the mobile app reports GPS
   * updates so matching can find the most recent position.
   */
  async updateLocation(userId: string, latitude: number, longitude: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { latitude, longitude },
      select: { id: true, latitude: true, longitude: true },
    });
  }

  // Find all donors with filters
  async findAllDonors(query: QueryDonorsDto) {
    const { skip, limit = 10, bloodType, isAvailable, eligibility, location, search } = query;

    const where: any = {
      role: Role.donor,
    };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (isAvailable !== undefined) {
      const isAvailBool = isAvailable === 'true';
      where.isAvailable = isAvailBool;
      where.donorProfile = {
        availableStatus: isAvailBool,
      };
    }

    if (bloodType) {
      where.donorProfile = {
        ...where.donorProfile,
        bloodType: {
          name: {
            equals: bloodType,
            mode: 'insensitive',
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Load initial users
    const users = await this.prisma.user.findMany({
      where,
      include: {
        donorProfile: {
          include: {
            bloodType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by eligibility programmatically if selected
    // Eligible: either lastDonationDate is null or > 56 days ago
    let filteredUsers = users;
    if (eligibility) {
      const now = new Date();
      const fiftySixDaysAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
      filteredUsers = users.filter((u) => {
        const lastDonation = u.donorProfile?.lastDonationDate;
        const isEligible = !lastDonation || new Date(lastDonation) < fiftySixDaysAgo;
        return eligibility === 'eligible' ? isEligible : !isEligible;
      });
    }

    const total = filteredUsers.length;
    const paginated = filteredUsers.slice(skip, skip + limit);

    return {
      items: paginated,
      meta: {
        total,
        page: query.page ?? 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneDonor(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        donorProfile: {
          include: {
            bloodType: true,
          },
        },
      },
    });
    if (!user || user.role !== Role.donor) {
      throw new NotFoundException('Donor not found');
    }
    return user;
  }

  async createDonorAdmin(dto: CreateDonorAdminDto) {
    const existingEmail = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });
    if (existingEmail) {
      throw new ConflictException('Email or Phone is already registered');
    }

    const bloodType = await this.bloodTypesService.findByName(dto.bloodType);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: Role.donor,
        location: dto.location || 'Kuala Lumpur',
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
      },
    });

    const lastDonation = dto.lastDonationDate ? new Date(dto.lastDonationDate) : null;

    const donorProfile = await this.prisma.donorProfile.create({
      data: {
        userId: user.id,
        bloodTypeId: bloodType.id,
        availableStatus: dto.isAvailable !== undefined ? dto.isAvailable : true,
        lastDonationDate: lastDonation,
      },
      include: {
        bloodType: true,
      },
    });

    return {
      ...user,
      donorProfile,
    };
  }

  async updateDonorAdmin(id: string, dto: UpdateDonorAdminDto) {
    const user = await this.findOneDonor(id);

    let hashedPassword: string | undefined = undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        location: dto.location,
        isAvailable: dto.isAvailable,
      },
    });

    let bloodTypeId = user.donorProfile?.bloodTypeId;
    if (dto.bloodType) {
      const bt = await this.bloodTypesService.findByName(dto.bloodType);
      bloodTypeId = bt.id;
    }

    const lastDonation = dto.lastDonationDate !== undefined
      ? (dto.lastDonationDate ? new Date(dto.lastDonationDate) : null)
      : undefined;

    const donorProfile = await this.prisma.donorProfile.update({
      where: { userId: id },
      data: {
        bloodTypeId,
        availableStatus: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
        lastDonationDate: lastDonation,
      },
      include: {
        bloodType: true,
      },
    });

    return {
      ...updatedUser,
      donorProfile,
    };
  }

  async deleteDonorAdmin(id: string) {
    await this.findOneDonor(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
