import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonorMatchingService } from './donor-matching.service';
import { NearbyDonorsQueryDto } from './dto/nearby-donors-query.dto';

@ApiTags('Donors')
@ApiBearerAuth('access-token')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorMatchingService: DonorMatchingService) {}

  @Get('nearby')
  @ApiOperation({
    summary: 'Find nearby compatible donors for a required blood type',
    description:
      'Returns compatible, available donors within the given radius, sorted by ' +
      'distance. Exact GPS coordinates and phone numbers are never returned — ' +
      'only approximate distance, city, availability and blood type.',
  })
  async findNearby(@Query() query: NearbyDonorsQueryDto) {
    const { items, total } = await this.donorMatchingService.findMatchingDonors({
      requiredBloodType: query.bloodType,
      latitude: query.latitude,
      longitude: query.longitude,
      radiusKm: query.radius,
      page: query.page,
      limit: query.limit,
    });

    // Strip the internal-only userId before returning to the client
    const data = items.map(({ userId, ...safe }) => safe);

    return {
      message: 'Nearby donors retrieved successfully',
      data: {
        items: data,
        meta: {
          total,
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          totalPages: Math.ceil(total / (query.limit ?? 10)),
        },
      },
    };
  }
}
