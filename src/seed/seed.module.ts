import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { SchoolClass } from '../classes/class.entity';
import { Student } from '../students/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SchoolClass, Student])],
  providers: [SeedService],
})
export class SeedModule {}
