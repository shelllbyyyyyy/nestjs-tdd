import { Module } from '@nestjs/common';

import { UserService } from './application/services/user.service';
import { UserServices } from './domain/services';
import { UserRepository } from './domain/repositories/user.repository';
import { UserController } from './presentation/controllers/user.controller';
import { UserRepositoryImpl } from './persistence/repositories/user.repository';
import { DatabaseModule } from '@/shared/db/database.module';

const userRepository = {
  provide: UserRepository,
  useClass: UserRepositoryImpl,
};

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ...UserServices, userRepository],
})
export class UserModule {}
