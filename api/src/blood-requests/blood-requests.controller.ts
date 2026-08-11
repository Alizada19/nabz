import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BloodRequestsService } from './blood-requests.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { QueryBloodRequestDto } from './dto/query-blood-request.dto';
import { UpdateBloodRequestStatusDto } from './dto/update-status.dto';
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Blood Requests')
@ApiBearerAuth('access-token')
@Controller('blood-requests')
export class BloodRequestsController {
  constructor(private readonly bloodRequestsService: BloodRequestsService) {}

  @Post()
  @Roles(Role.individual, Role.hospital, Role.blood_bank, Role.ngo, Role.admin)
  @ApiOperation({
    summary: 'Create an emergency blood request',
    description:
      'Automatically triggers compatible-donor matching and notifies nearby ' +
      'available donors within the configured radius.',
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBloodRequestDto,
  ) {
    const data = await this.bloodRequestsService.create(user.id, user.role, dto);
    return { message: 'Blood request created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all blood requests (paginated with filters)' })
  async findAll(@Query() query: QueryBloodRequestDto) {
    const data = await this.bloodRequestsService.findAll(query);
    return { message: 'All blood requests retrieved successfully', data };
  }

  @Get('my')
  @Roles(Role.individual, Role.hospital, Role.blood_bank, Role.ngo, Role.admin)
  @ApiOperation({ summary: "List the current requester's blood requests (paginated)" })
  async findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryBloodRequestDto,
  ) {
    const data = await this.bloodRequestsService.findMyRequests(user.id, query);
    return { message: 'Blood requests retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single blood request by id' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const data = await this.bloodRequestsService.findOne(id, user.id, user.role);
    return { message: 'Blood request retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.individual, Role.hospital, Role.blood_bank, Role.ngo, Role.admin)
  @ApiOperation({ summary: 'Update/Edit blood request details' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBloodRequestDto,
  ) {
    const data = await this.bloodRequestsService.update(id, user.id, user.role, dto);
    return { message: 'Blood request updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.individual, Role.hospital, Role.blood_bank, Role.ngo, Role.admin)
  @ApiOperation({ summary: 'Delete blood request' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.bloodRequestsService.remove(id, user.id, user.role);
    return { message: 'Blood request deleted successfully' };
  }

  @Patch(':id/status')
  @Roles(Role.individual, Role.hospital, Role.blood_bank, Role.ngo, Role.admin)
  @ApiOperation({ summary: 'Update the status of a blood request' })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBloodRequestStatusDto,
  ) {
    const data = await this.bloodRequestsService.updateStatus(
      id,
      user.id,
      user.role,
      dto,
    );
    return { message: 'Blood request status updated successfully', data };
  }
}
