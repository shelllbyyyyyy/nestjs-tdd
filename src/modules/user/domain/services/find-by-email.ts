import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class FindByEmail {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string) {
    return await this.userRepository.findByEmail(email);
  }
}
