import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findByBaleId(baleId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { baleId } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { name: 'ASC' } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userRepo.find({ where: { role }, order: { name: 'ASC' } });
  }

  async updateRole(id: number, role: UserRole): Promise<User | null> {
    await this.userRepo.update(id, { role });
    return this.findById(id);
  }

  async updateBaleId(id: number, baleId: string): Promise<User | null> {
    await this.userRepo.update(id, { baleId });
    return this.findById(id);
  }

  async findPendingUsers(): Promise<User[]> {
    return this.userRepo.find({
      where: { baleId: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

  async getDirectorsAndVicePrincipals(): Promise<User[]> {
    return this.userRepo.find({
      where: [{ role: UserRole.DIRECTOR }, { role: UserRole.VICE_PRINCIPAL }],
    });
  }

  async getAdminAndDirectorsAndVicePrincipals(): Promise<User[]> {
    return this.userRepo.find({
      where: [
        { role: UserRole.ADMIN },
        { role: UserRole.DIRECTOR },
        { role: UserRole.VICE_PRINCIPAL },
      ],
    });
  }
}
