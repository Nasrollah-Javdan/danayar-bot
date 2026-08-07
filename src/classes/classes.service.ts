import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolClass } from './class.entity';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(SchoolClass)
    private readonly classRepo: Repository<SchoolClass>,
  ) {}

  async create(dto: CreateClassDto): Promise<SchoolClass> {
    const schoolClass = this.classRepo.create(dto);
    return this.classRepo.save(schoolClass);
  }

  async findAll(): Promise<SchoolClass[]> {
    return this.classRepo.find({
      relations: { teacher: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<SchoolClass | null> {
    return this.classRepo.findOne({
      where: { id },
      relations: { teacher: true },
    });
  }

  async findByTeacherId(teacherId: number): Promise<SchoolClass[]> {
    return this.classRepo.find({
      where: { teacherId },
      order: { name: 'ASC' },
    });
  }

  async update(
    id: number,
    dto: Partial<CreateClassDto>,
  ): Promise<SchoolClass | null> {
    await this.classRepo.update(id, dto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.classRepo.delete(id);
  }
}
