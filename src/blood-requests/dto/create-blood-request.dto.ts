import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UrgencyLevel, RequestType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBloodRequestDto {
  @ApiPropertyOptional({ enum: RequestType, default: RequestType.INDIVIDUAL })
  @IsOptional()
  @IsEnum(RequestType)
  requestType?: RequestType;

  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  bloodType: string;

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

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  unitsRequired?: number;

  @ApiPropertyOptional({ enum: UrgencyLevel, default: UrgencyLevel.medium })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;

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
