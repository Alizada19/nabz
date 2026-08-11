import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonorMatchingService } from './donor-matching.service';
import { NearbyDonorsQueryDto } from './dto/nearby-donors-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

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

  // --- CRUD Donors Management Endpoints (Admin only) ---

  @Get()
  @Roles(Role.admin)
  @ApiOperation({ summary: 'List individual blood donors with search and filters (Admin)' })
  async listDonors(@Query() query: any) {
    const data = await this.donorMatchingService.listDonors(query);
    return { message: 'Donors list retrieved successfully', data };
  }

  @Post()
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Register a new individual donor (Admin only)' })
  async registerDonor(@Body() body: any) {
    const data = await this.donorMatchingService.registerDonor(body);
    return { message: 'Donor registered successfully', data };
  }

  @Get(':id')
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Get details of an individual donor (Admin only)' })
  async findOne(@Param('id') id: string) {
    const data = await this.donorMatchingService.findDonorById(id);
    return { message: 'Donor details retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Edit an individual donor details (Admin only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.donorMatchingService.updateDonor(id, body);
    return { message: 'Donor updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Delete an individual donor (Admin only)' })
  async remove(@Param('id') id: string) {
    await this.donorMatchingService.deleteDonor(id);
    return { message: 'Donor deleted successfully' };
  }
}
