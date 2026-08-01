import { Module } from '@nestjs/common';
import { BloodRequestsService } from './blood-requests.service';
import { BloodRequestsController } from './blood-requests.controller';
import { BloodTypesModule } from '../blood-types/blood-types.module';
import { MatchingModule } from '../matching/matching.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [BloodTypesModule, MatchingModule, NotificationsModule],
  controllers: [BloodRequestsController],
  providers: [BloodRequestsService],
  exports: [BloodRequestsService],
})
export class BloodRequestsModule {}
