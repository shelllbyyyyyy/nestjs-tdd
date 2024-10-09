import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '@/modules/auth/application/services/auth.service';

import { CreateUser, FindByEmail } from '@/modules/user/domain/services';
import { User } from '@/modules/user/domain/entities/user.entity';

import { BcryptService } from '@/shared/bcrypt';
import { RedisService } from '@/shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let findByEmail: FindByEmail;
  let createUser: CreateUser;
  let bcrypt: BcryptService;
  let jwt: JwtService;
  let redis: RedisService;
  let configService: ConfigService;

  const mockFindByEmail = {
    execute: jest.fn(),
  };

  const mockCreateUSer = {
    execute: jest.fn(),
  };

  const mockBecryptService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const id = randomUUID();
  const username = 'Luzma';
  const email = 'luzmacantik@gmail.com';
  const password = '12345678';
  const hashedPassword = 'HashedPassword';

  const data = {
    username,
    email,
    password: hashedPassword,
  };

  const login = {
    email,
    password,
  };

  const payload = {
    sub: id,
    email,
  };

  const access_token = 'access_token';
  const refresh_token = 'refresh_token';

  const redisAccessToken = `userAccessToken_${id}: `;
  const redisRefreshToken = `userRefreshToken_${id}: `;

  const newUser = User.create({
    id,
    email: data.email,
    password: hashedPassword,
    username: data.username,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: FindByEmail,
          useValue: mockFindByEmail,
        },
        {
          provide: CreateUser,
          useValue: mockCreateUSer,
        },
        {
          provide: BcryptService,
          useValue: mockBecryptService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    findByEmail = module.get<FindByEmail>(FindByEmail);
    createUser = module.get<CreateUser>(CreateUser);
    bcrypt = module.get<BcryptService>(BcryptService);
    jwt = module.get<JwtService>(JwtService);
    redis = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(createUser).toBeDefined();
    expect(bcrypt).toBeDefined();
    expect(jwt).toBeDefined();
    expect(redis).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('Register user ', () => {
    it('Should success register user', async () => {
      mockFindByEmail.execute.mockResolvedValue(null);
      mockBecryptService.hashPassword.mockResolvedValue(hashedPassword);
      mockCreateUSer.execute.mockResolvedValue(newUser);

      const result = await service.register({ username, email, password });

      expect(result).toEqual(newUser);
      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockCreateUSer.execute).toHaveBeenCalledWith(data);
    });

    it('Should error register user', async () => {
      mockFindByEmail.execute.mockResolvedValue(newUser);

      await expect(service.register(data)).rejects.toThrow(
        new BadRequestException('Email has already been registered'),
      );
      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.hashPassword).not.toHaveBeenCalledWith(
        password,
      );
      expect(mockCreateUSer.execute).not.toHaveBeenCalledWith(data);
    });
  });

  describe('Login', () => {
    it('Should success, login with valid creadentials', async () => {
      mockFindByEmail.execute.mockResolvedValue(newUser);
      mockBecryptService.comparePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce(access_token);
      mockJwtService.signAsync.mockResolvedValueOnce(refresh_token);
      mockRedisService.set.mockResolvedValueOnce(redisAccessToken);
      mockRedisService.set.mockResolvedValueOnce(redisRefreshToken);

      const result = await service.login(login);

      expect(result).toEqual({ access_token, refresh_token });
      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        expiresIn: '1h',
        secret: configService.get('ACCESS_TOKEN_SECRET'),
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
        secret: configService.get('REFRESH_TOKEN_SECRET'),
      });
    });

    it('Should error email not registered, login with invalid creadentials', async () => {
      mockFindByEmail.execute.mockResolvedValue(null);

      await expect(service.login(login)).rejects.toThrow(
        new BadRequestException('Email not registered'),
      );

      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.comparePassword).not.toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).not.toHaveBeenCalledWith(payload, {
        expiresIn: '1h',
        secret: configService.get('ACCESS_TOKEN_SECRET'),
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
        secret: configService.get('REFRESH_TOKEN_SECRET'),
      });
    });

    it('Should error unauthorized, login with invalid creadentials', async () => {
      mockFindByEmail.execute.mockResolvedValue(newUser);
      mockBecryptService.comparePassword.mockResolvedValue(false);

      await expect(service.login(login)).rejects.toThrow(
        new BadRequestException('Wrong password'),
      );

      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).not.toHaveBeenCalledWith(payload, {
        expiresIn: '1h',
        secret: configService.get('ACCESS_TOKEN_SECRET'),
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
        secret: configService.get('REFRESH_TOKEN_SECRET'),
      });
    });
  });
});
