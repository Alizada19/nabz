import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDonorProfileDto {
  @ApiProperty({ example: 'O+' })
  @IsString()
  bloodType: string;
}
