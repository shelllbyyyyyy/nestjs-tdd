import { Injectable, NotFoundException, Logger } from '@nestjs/common';

import { FindByEmail, FindById } from '../../domain/services';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly findUserById: FindById,
    private readonly findUserByEmail: FindByEmail,
  ) {}

  async findOneById(id: string) {
    const user = await this.findUserById.execute(id);

    if (!user) throw new NotFoundException('User not found');

    this.logger.log(`[${user.email}] User found`);
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.findUserByEmail.execute(email);

    if (!user) throw new NotFoundException('Email not registered yet');

    this.logger.log(`[${user.email}] User found`);
    return user;
  }
}
