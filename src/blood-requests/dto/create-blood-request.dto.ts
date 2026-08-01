import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UrgencyLevel } from '@prisma/client';
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
  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  bloodType: string;

  @ApiProperty({ example: 'Hospital Kuala Lumpur' })
  @IsString()
  @IsNotEmpty()
  hospitalName: string;

  @ApiProperty({ example: 'Jalan Pahang, 53000 Kuala Lumpur' })
  @IsString()
  @IsNotEmpty()
  hospitalAddress: string;

  @ApiProperty({ example: 3.1725 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 101.7017 })
  @IsLongitude()
  longitude: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  unitsRequired: number;

  @ApiPropertyOptional({ enum: UrgencyLevel, default: UrgencyLevel.medium })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;
}
