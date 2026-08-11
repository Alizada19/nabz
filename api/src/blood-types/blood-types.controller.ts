import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BloodTypesService } from './blood-types.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Blood Types')
@Controller('blood-types')
export class BloodTypesController {
  constructor(private readonly bloodTypesService: BloodTypesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all reference blood types (A+, A-, B+, ...)' })
  async findAll() {
    const data = await this.bloodTypesService.findAll();
    return { message: 'Blood types retrieved successfully', data };
  }
}
