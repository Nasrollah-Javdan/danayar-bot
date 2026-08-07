import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { AdminHandler } from './handlers/admin.handler';
import { DirectorHandler } from './handlers/director.handler';
import { TeacherHandler } from './handlers/teacher.handler';
import { BaleModule } from '../bale/bale.module';
import { UsersModule } from '../users/users.module';
import { ClassesModule } from '../classes/classes.module';
import { StudentsModule } from '../students/students.module';
import { TasksModule } from '../tasks/tasks.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BaleModule,
    UsersModule,
    ClassesModule,
    StudentsModule,
    TasksModule,
    AttendanceModule,
    NotificationsModule,
  ],
  providers: [BotService, AdminHandler, DirectorHandler, TeacherHandler],
})
export class BotModule {}
