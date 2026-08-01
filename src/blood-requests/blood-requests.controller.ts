import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BloodRequestsService } from './blood-requests.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { QueryBloodRequestDto } from './dto/query-blood-request.dto';
import { UpdateBloodRequestStatusDto } from './dto/update-status.dto';
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
  @Roles(Role.seeker, Role.admin)
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

  @Get('my')
  @Roles(Role.seeker, Role.admin)
  @ApiOperation({ summary: "List the current seeker's blood requests (paginated)" })
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

  @Patch(':id/status')
  @Roles(Role.seeker, Role.admin)
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
