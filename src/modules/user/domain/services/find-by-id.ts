import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class FindById {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    return await this.userRepository.findById(id);
  }
}
