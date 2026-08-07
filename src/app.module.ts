import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/user.entity';
import { SchoolClass } from './classes/class.entity';
import { Student } from './students/student.entity';
import { Task } from './tasks/task.entity';
import { Attendance } from './attendance/attendance.entity';
import { AttendanceRecord } from './attendance/attendance-record.entity';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { TasksModule } from './tasks/tasks.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BotModule } from './bot/bot.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || './db.sqlite',
      entities: [
        User,
        SchoolClass,
        Student,
        Task,
        Attendance,
        AttendanceRecord,
      ],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ClassesModule,
    StudentsModule,
    TasksModule,
    AttendanceModule,
    NotificationsModule,
    BotModule,
    SchedulerModule,
    SeedModule,
  ],
})
export class AppModule {}
