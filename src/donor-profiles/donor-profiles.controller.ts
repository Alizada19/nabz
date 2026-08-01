import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonorProfilesService } from './donor-profiles.service';
import { CreateDonorProfileDto } from './dto/create-donor-profile.dto';
import { UpdateDonorProfileDto } from './dto/update-donor-profile.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Donor Profiles')
@ApiBearerAuth('access-token')
@Controller('donor-profiles')
export class DonorProfilesController {
  constructor(private readonly donorProfilesService: DonorProfilesService) {}

  @Post()
  @Roles(Role.donor)
  @ApiOperation({ summary: 'Create a donor profile for the current donor' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDonorProfileDto,
  ) {
    const data = await this.donorProfilesService.createForUser(
      user.id,
      user.role,
      dto,
    );
    return { message: 'Donor profile created successfully', data };
  }

  @Get('me')
  @Roles(Role.donor)
  @ApiOperation({ summary: 'Get the current donor profile' })
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.donorProfilesService.findByUserId(user.id);
    return { message: 'Donor profile retrieved successfully', data };
  }

  @Patch('me')
  @Roles(Role.donor)
  @ApiOperation({
    summary: 'Update blood type, availability, or last donation date',
  })
  async updateMine(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDonorProfileDto,
  ) {
    const data = await this.donorProfilesService.update(user.id, dto);
    return { message: 'Donor profile updated successfully', data };
  }

  @Patch('me/location')
  @Roles(Role.donor)
  @ApiOperation({ summary: "Update the donor's current GPS location" })
  async updateLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { latitude: number; longitude: number },
  ) {
    const data = await this.donorProfilesService.updateLocation(
      user.id,
      body.latitude,
      body.longitude,
    );
    return { message: 'Location updated successfully', data };
  }
}
