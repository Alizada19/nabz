import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateHospitalDto {
  @ApiProperty({ example: 'General Hospital' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Medical Center Way' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 3.1390 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 101.6869 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '+60123456789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'info@generalhospital.com' })
  @IsEmail()
  email: string;
}
