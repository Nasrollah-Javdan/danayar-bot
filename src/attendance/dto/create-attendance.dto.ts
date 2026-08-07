import { IsNumber, IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  classId: number;

  @IsNumber()
  teacherId: number;

  @IsString()
  date: string;

  @IsBoolean()
  isAbsent: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}
