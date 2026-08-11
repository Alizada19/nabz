import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonorProfilesService } from './donor-profiles.service';
import { CreateDonorProfileDto } from './dto/create-donor-profile.dto';
import { UpdateDonorProfileDto } from './dto/update-donor-profile.dto';
import { QueryDonorsDto } from './dto/query-donors.dto';
import { CreateDonorAdminDto } from './dto/create-donor-admin.dto';
import { UpdateDonorAdminDto } from './dto/update-donor-admin.dto';
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
  @Roles(Role.individual, Role.admin)
  @ApiOperation({ summary: 'Create a donor profile for the current individual' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDonorProfileDto,
  ) {
    const data = await this.donorProfilesService.createForUser(user.id, dto);
    return { message: 'Donor profile created successfully', data };
  }

  @Get('me')
  @Roles(Role.individual, Role.admin)
  @ApiOperation({ summary: 'Get the current donor profile' })
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.donorProfilesService.findByUserId(user.id);
    return { message: 'Donor profile retrieved successfully', data };
  }

  @Patch('me')
  @Roles(Role.individual, Role.admin)
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
  @Roles(Role.individual, Role.admin)
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

  @Delete('me')
  @Roles(Role.individual, Role.admin)
  @ApiOperation({ summary: 'Remove donor profile (stop being an active donor)' })
  async removeMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.donorProfilesService.removeForUser(user.id);
    return { message: 'Donor profile removed successfully', data };
  }

  @Get('all-donors')
  @ApiOperation({ summary: 'List all individual blood donors (paginated with filters)' })
  async findAllDonors(@Query() query: QueryDonorsDto) {
    const data = await this.donorProfilesService.findAllDonors(query);
    return { message: 'Donors retrieved successfully', data };
  }

  @Get('all-donors/:id')
  @ApiOperation({ summary: 'Get details of a specific donor' })
  async findOneDonor(@Param('id') id: string) {
    const data = await this.donorProfilesService.findOneDonor(id);
    return { message: 'Donor retrieved successfully', data };
  }

  @Post('all-donors')
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Register/create a new individual donor (Admin only)' })
  async createDonor(@Body() dto: CreateDonorAdminDto) {
    const data = await this.donorProfilesService.createDonorAdmin(dto);
    return { message: 'Donor registered successfully', data };
  }

  @Patch('all-donors/:id')
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Update/Edit donor profile details (Admin only)' })
  async updateDonor(@Param('id') id: string, @Body() dto: UpdateDonorAdminDto) {
    const data = await this.donorProfilesService.updateDonorAdmin(id, dto);
    return { message: 'Donor updated successfully', data };
  }

  @Delete('all-donors/:id')
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Delete a donor user and profile (Admin only)' })
  async deleteDonor(@Param('id') id: string) {
    await this.donorProfilesService.deleteDonorAdmin(id);
    return { message: 'Donor deleted successfully' };
  }
}
