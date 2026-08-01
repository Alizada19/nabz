import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { GeoService } from '../common/services/geo.service';
import { BloodCompatibilityService } from './blood-compatibility.service';
import { MatchedDonorDto } from './dto/matched-donor.dto';

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
}
