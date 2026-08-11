import { ApiProperty } from '@nestjs/swagger';

/**
 * Privacy-safe representation of a matched donor.
 * Never exposes: exact GPS coordinates, phone number, email, or donor id
 * beyond what's needed to route a notification server-side.
 */
export class MatchedDonorDto {
  @ApiProperty({ description: 'Approximate distance in kilometers', example: 4.2 })
  distanceKm: number;

  @ApiProperty({ example: 'Kuala Lumpur, Malaysia', nullable: true })
  city: string | null;

  @ApiProperty({ example: true })
  availability: boolean;

  @ApiProperty({ example: 'A+' })
  bloodType: string;

  @ApiProperty({ example: 'Ahmad Z.', description: 'First name + last-initial only' })
  displayName: string;
}
