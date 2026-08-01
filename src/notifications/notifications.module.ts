import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FcmProvider } from './fcm.provider';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
