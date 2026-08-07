import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create(dto);
    return this.taskRepo.save(task);
  }

  async findIncomplete(): Promise<Task[]> {
    return this.taskRepo.find({
      where: { isCompleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Task | null> {
    return this.taskRepo.findOne({
      where: { id },
      relations: { completedBy: true },
    });
  }

  async complete(id: number, completedById: number): Promise<Task | null> {
    await this.taskRepo.update(id, {
      isCompleted: true,
      completedById,
      completedAt: new Date(),
    });
    return this.findById(id);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({
      relations: { completedBy: true },
      order: { createdAt: 'DESC' },
    });
  }
}
