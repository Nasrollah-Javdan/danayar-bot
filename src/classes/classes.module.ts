import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolClass } from './class.entity';
import { ClassesService } from './classes.service';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolClass])],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
