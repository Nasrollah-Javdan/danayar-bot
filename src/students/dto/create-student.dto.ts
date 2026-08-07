import { IsString, IsNumber } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsNumber()
  classId: number;
}

export class BulkCreateStudentDto {
  @IsNumber()
  classId: number;

  @IsString()
  names: string;
}
