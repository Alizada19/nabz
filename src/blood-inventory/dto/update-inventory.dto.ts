import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  bloodType: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  unitsStored: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  minThreshold: number;
}
