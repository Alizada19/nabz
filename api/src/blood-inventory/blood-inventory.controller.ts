import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BloodInventoryService } from './blood-inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Blood Inventory')
@ApiBearerAuth('access-token')
@Controller('blood-inventory')
export class BloodInventoryController {
  constructor(private readonly bloodInventoryService: BloodInventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all blood inventory stocks' })
  findAll() {
    return this.bloodInventoryService.findAll();
  }

  @Patch()
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Update blood inventory stocks (Admin only)' })
  update(@Body() dto: UpdateInventoryDto) {
    return this.bloodInventoryService.update(dto);
  }
}
