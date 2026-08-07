import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TasksModule, UsersModule, NotificationsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
