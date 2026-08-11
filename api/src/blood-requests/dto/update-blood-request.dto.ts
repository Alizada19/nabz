import { ApiPropertyOptional } from '@nestjs/swagger';
import { UrgencyLevel, RequestStatus, RequestType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateBloodRequestDto {
  @ApiPropertyOptional({ enum: RequestType })
  @IsOptional()
  @IsEnum(RequestType)
  requestType?: RequestType;

  @ApiPropertyOptional({ example: 'A+' })
  @IsString()
  @IsOptional()
  bloodType?: string;

  @ApiPropertyOptional({ example: 'Hospital Kuala Lumpur' })
  @IsString()
  @IsOptional()
  hospitalName?: string;

  @ApiPropertyOptional({ example: 'Jalan Pahang, 53000 Kuala Lumpur' })
  @IsString()
  @IsOptional()
  hospitalAddress?: string;

  @ApiPropertyOptional({ example: 3.1725 })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 101.7017 })
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  unitsRequired?: number;

  @ApiPropertyOptional({ enum: UrgencyLevel })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requesterPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredHospital?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coordinatorName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coordinatorContact?: string;
}
