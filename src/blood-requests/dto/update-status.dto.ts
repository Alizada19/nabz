import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateBloodRequestStatusDto {
  @ApiProperty({ enum: RequestStatus, example: RequestStatus.matched })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
