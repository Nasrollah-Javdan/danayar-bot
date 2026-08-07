import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { SchoolClass } from '../classes/class.entity';
import { Student } from '../students/student.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SchoolClass)
    private readonly classRepo: Repository<SchoolClass>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      console.log('📦 Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database...');

    const admin = this.userRepo.create({
      name: 'مدیر سیستم',
      role: UserRole.ADMIN,
      baleId: process.env.ADMIN_ID,
    });
    await this.userRepo.save(admin);

    console.log('✅ Seed completed');
  }
}
