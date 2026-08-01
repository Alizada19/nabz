import { ConfigService } from '@nestjs/config';
import { DonorMatchingService } from './donor-matching.service';
import { BloodCompatibilityService } from './blood-compatibility.service';
import { GeoService } from '../common/services/geo.service';

describe('DonorMatchingService', () => {
  let service: DonorMatchingService;
  let prisma: { donorProfile: { findMany: jest.Mock } };
  let config: Partial<ConfigService>;

  const origin = { latitude: 3.139, longitude: 101.6869 };

  const buildProfile = (
    userId: string,
    bloodTypeName: string,
    lat: number,
    lng: number,
    availableStatus = true,
    userIsAvailable = true,
  ) => ({
    userId,
    availableStatus,
    bloodType: { name: bloodTypeName },
    user: {
      name: `Donor ${userId}`,
      latitude: lat,
      longitude: lng,
      location: 'Kuala Lumpur, Malaysia',
      isAvailable: userIsAvailable,
    },
  });

  beforeEach(() => {
    prisma = { donorProfile: { findMany: jest.fn() } };
    config = { get: jest.fn().mockReturnValue(50) };

    service = new DonorMatchingService(
      prisma as any,
      new GeoService(),
      new BloodCompatibilityService(),
      config as ConfigService,
    );
  });

  it('returns compatible donors sorted by distance ascending', async () => {
    prisma.donorProfile.findMany.mockResolvedValue([
      buildProfile('far', 'O-', 1.3521, 103.8198), // ~315km away
      buildProfile('near', 'O-', 3.14, 101.69), // very close
    ]);

    const result = await service.findMatchingDonors({
      requiredBloodType: 'O+',
      latitude: origin.latitude,
      longitude: origin.longitude,
      radiusKm: 500,
    });

    expect(result.items[0].userId).toBe('near');
    expect(result.items[0].distanceKm).toBeLessThan(result.items[1].distanceKm);
  });

  it('excludes donors outside the search radius', async () => {
    prisma.donorProfile.findMany.mockResolvedValue([
      buildProfile('far', 'O-', 1.3521, 103.8198), // ~315km away
    ]);

    const result = await service.findMatchingDonors({
      requiredBloodType: 'O+',
      latitude: origin.latitude,
      longitude: origin.longitude,
      radiusKm: 50,
    });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('masks donor names into first-name + last-initial format', async () => {
    prisma.donorProfile.findMany.mockResolvedValue([
      {
        ...buildProfile('u1', 'O-', 3.14, 101.69),
        user: {
          ...buildProfile('u1', 'O-', 3.14, 101.69).user,
          name: 'Ahmad Zulkifli',
        },
      },
    ]);

    const result = await service.findMatchingDonors({
      requiredBloodType: 'O+',
      latitude: origin.latitude,
      longitude: origin.longitude,
    });

    expect(result.items[0].displayName).toBe('Ahmad Z.');
  });

  it('never exposes latitude/longitude fields on matched donors', async () => {
    prisma.donorProfile.findMany.mockResolvedValue([
      buildProfile('u1', 'O-', 3.14, 101.69),
    ]);

    const result = await service.findMatchingDonors({
      requiredBloodType: 'O+',
      latitude: origin.latitude,
      longitude: origin.longitude,
    });

    expect(result.items[0]).not.toHaveProperty('latitude');
    expect(result.items[0]).not.toHaveProperty('longitude');
  });

  it('paginates results correctly', async () => {
    prisma.donorProfile.findMany.mockResolvedValue([
      buildProfile('u1', 'O-', 3.14, 101.69),
      buildProfile('u2', 'O-', 3.141, 101.691),
      buildProfile('u3', 'O-', 3.142, 101.692),
    ]);

    const result = await service.findMatchingDonors({
      requiredBloodType: 'O+',
      latitude: origin.latitude,
      longitude: origin.longitude,
      page: 1,
      limit: 2,
    });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
  });
});
