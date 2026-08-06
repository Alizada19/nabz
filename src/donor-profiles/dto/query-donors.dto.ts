import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryDonorsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isAvailable?: string; // 'true' or 'false'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eligibility?: string; // 'eligible' or 'ineligible'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
