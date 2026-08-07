import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  teacherId?: number;
}
