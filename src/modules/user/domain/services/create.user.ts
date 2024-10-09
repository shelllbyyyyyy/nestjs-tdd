import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../../presentation/controllers/dto/create-user.dto';

export const id = randomUUID();

@Injectable()
export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserDto) {
    const newUser = User.create({ ...data, id });

    return await this.userRepository.create(newUser);
  }
}
