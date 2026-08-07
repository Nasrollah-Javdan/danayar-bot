import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(AttendanceRecord)
    private readonly recordRepo: Repository<AttendanceRecord>,
  ) {}

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    const record = this.attendanceRepo.create(dto);
    return this.attendanceRepo.save(record);
  }

  async bulkCreate(dtos: CreateAttendanceDto[]): Promise<Attendance[]> {
    const records = dtos.map((dto) => this.attendanceRepo.create(dto));
    return this.attendanceRepo.save(records);
  }

  async createRecord(data: {
    classId: number;
    teacherId: number;
    date: string;
    hasAbsence: boolean;
    description?: string;
  }): Promise<AttendanceRecord> {
    const record = this.recordRepo.create(data);
    return this.recordRepo.save(record);
  }

  async findRecordByClassAndDate(
    classId: number,
    date: string,
  ): Promise<AttendanceRecord | null> {
    return this.recordRepo.findOne({ where: { classId, date } });
  }

  async findByClassAndDate(
    classId: number,
    date: string,
  ): Promise<Attendance[]> {
    return this.attendanceRepo.find({
      where: { classId, date },
      relations: { student: true },
    });
  }

  async findByStudentId(studentId: number): Promise<Attendance[]> {
    return this.attendanceRepo.find({
      where: { studentId },
      order: { date: 'DESC' },
    });
  }

  async addFeedback(id: number, feedback: string): Promise<Attendance | null> {
    await this.attendanceRepo.update(id, { feedback });
    return this.attendanceRepo.findOne({
      where: { id },
      relations: { student: true },
    });
  }
}
