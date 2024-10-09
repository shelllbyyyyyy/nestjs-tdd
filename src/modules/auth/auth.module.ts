import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controller/auth.controller';
import { CreateUser, FindByEmail } from '../user/domain/services';
import { UserRepository } from '../user/domain/repositories/user.repository';
import { UserRepositoryImpl } from '../user/persistence/repositories/user.repository';

import { BcryptService } from '@/shared/bcrypt';
import { LocalStrategy } from '@/shared/passport/strategies/local.strategy';
import { DatabaseModule } from '@/shared/db/database.module';
import { RedisModule } from '@/shared/redis/redis.module';

const userRepository = {
  provide: UserRepository,
  useClass: UserRepositoryImpl,
};

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtService,
    AuthService,
    CreateUser,
    FindByEmail,
    BcryptService,
    userRepository,
    LocalStrategy,
  ],
})
export class AuthModule {}
