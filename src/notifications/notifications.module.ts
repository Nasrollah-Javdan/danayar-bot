import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UsersModule } from '../users/users.module';
import { BaleModule } from '../bale/bale.module';

@Module({
  imports: [UsersModule, BaleModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
