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
}
