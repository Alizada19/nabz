import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BloodTypesModule } from './blood-types/blood-types.module';
import { DonorProfilesModule } from './donor-profiles/donor-profiles.module';
import { BloodRequestsModule } from './blood-requests/blood-requests.module';
import { MatchingModule } from './matching/matching.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl')! * 1000,
          limit: config.get<number>('throttle.limit')!,
        },
      ],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BloodTypesModule,
    DonorProfilesModule,
    MatchingModule,
    BloodRequestsModule,
    NotificationsModule,
  ],
  providers: [
    // Global API rate limiting (throttling) on top of JWT/Roles guards
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
