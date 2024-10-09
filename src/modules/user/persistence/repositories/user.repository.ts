import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/shared/db/database.service';

import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: User): Promise<User> {
    const username = data.username;
    const email = data.email;
    const password = data.password;

    const query = `INSERT INTO users (username, email, password)
                   VALUES ($1, $2, $3)
                   RETURNING *;`;

    const result = await this.db.query(query, [username, email, password]);

    return result[0];
  }

  async findByEmail(email: string): Promise<User> {
    const query = `SELECT * FROM users  WHERE email = $1;`;

    const result = await this.db.query(query, [email]);

    return result[0];
  }

  async findById(id: string): Promise<User> {
    const query = `SELECT * FROM users  WHERE id = $1;`;

    const result = await this.db.query(query, [id]);

    return result[0];
  }
}
