import { Module } from '@nestjs/common';
import { BloodCompatibilityService } from './blood-compatibility.service';
import { DonorMatchingService } from './donor-matching.service';
import { DonorsController } from './donors.controller';
import { GeoService } from '../common/services/geo.service';

@Module({
  controllers: [DonorsController],
  providers: [BloodCompatibilityService, DonorMatchingService, GeoService],
  exports: [BloodCompatibilityService, DonorMatchingService],
})
export class MatchingModule {}
