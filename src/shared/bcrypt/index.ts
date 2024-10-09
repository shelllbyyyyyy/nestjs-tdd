import { Injectable } from '@nestjs/common';

import { compare, hash } from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor() {}

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  async comparePassword(
    inputPassword: string,
    dbPassword: string,
  ): Promise<boolean> {
    return await compare(inputPassword, dbPassword);
  }
}
