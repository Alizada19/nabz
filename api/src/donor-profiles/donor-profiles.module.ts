import { Module } from '@nestjs/common';
import { DonorProfilesService } from './donor-profiles.service';
import { DonorProfilesController } from './donor-profiles.controller';
import { BloodTypesModule } from '../blood-types/blood-types.module';

@Module({
  imports: [BloodTypesModule],
  controllers: [DonorProfilesController],
  providers: [DonorProfilesService],
  exports: [DonorProfilesService],
})
export class DonorProfilesModule {}
