import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDonorProfileDto {
  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  availableStatus?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastDonationDate?: string;
}
