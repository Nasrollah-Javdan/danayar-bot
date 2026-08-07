import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, AttendanceRecord])],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
