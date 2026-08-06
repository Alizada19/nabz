import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmad Zulkifli' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ahmad@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+60123456789' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ enum: Role, example: Role.donor })
  @IsEnum(Role, { message: 'Role must be one of: admin, donor, seeker, hospital, blood_bank' })
  role: Role;

  @ApiProperty({ example: 3.139, required: false })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ example: 101.6869, required: false })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ example: 'Kuala Lumpur, Malaysia', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
