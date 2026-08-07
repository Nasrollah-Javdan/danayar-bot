import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepo.create(dto);
    return this.studentRepo.save(student);
  }

  async bulkCreate(classId: number, names: string[]): Promise<Student[]> {
    const students = names.map((name) =>
      this.studentRepo.create({ name: name.trim(), classId }),
    );
    return this.studentRepo.save(students);
  }

  async findByClassId(classId: number): Promise<Student[]> {
    return this.studentRepo.find({
      where: { classId },
      order: { name: 'ASC' },
    });
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepo.find({
      relations: { schoolClass: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Student | null> {
    return this.studentRepo.findOne({
      where: { id },
      relations: { schoolClass: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.studentRepo.delete(id);
  }

  async removeByClassId(classId: number): Promise<void> {
    await this.studentRepo.delete({ classId });
  }
}
