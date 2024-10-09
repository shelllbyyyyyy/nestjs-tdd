import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { CreateUser, FindByEmail } from '@/modules/user/domain/services';
import { CreateUserDto } from '@/modules/user/presentation/controllers/dto/create-user.dto';

import { BcryptService } from '@/shared/bcrypt';
import { RedisService } from '@/shared/redis/redis.service';

import { LoginDto } from '../../presentation/controller/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly findUser: FindByEmail,
    private readonly createUser: CreateUser,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: CreateUserDto) {
    const user = await this.findUser.execute(data.email);

    if (user) {
      throw new BadRequestException('Email has already been registered');
    }

    const hashedPassword = await this.bcryptService.hashPassword(data.password);

    return await this.createUser.execute({
      password: hashedPassword,
      username: data.username,
      email: data.email,
    });
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.validateCredentialsUser({ email, password });

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    await Promise.all([
      this.redisService.set(
        `userAccessToken_${user.id}: `,
        access_token,
        60 * 60,
      ),
      this.redisService.set(
        `userRefreshToken_${user.id}: `,
        refresh_token,
        7 * 24 * 60 * 60,
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async validateCredentialsUser(data: LoginDto) {
    const { email, password } = data;

    const user = await this.findUser.execute(email);

    if (!user) throw new BadRequestException(`Email not registered`);

    const compare = await this.bcryptService.comparePassword(
      password,
      user.password,
    );

    if (!compare) throw new UnauthorizedException(`Wrong password`);

    return user;
  }
}
