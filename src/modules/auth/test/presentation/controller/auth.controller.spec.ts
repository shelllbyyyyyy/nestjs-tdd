import { randomUUID } from 'crypto';
import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, HttpStatus } from '@nestjs/common';

import { AuthController } from '@/modules/auth/presentation/controller/auth.controller';
import { AuthService } from '@/modules/auth/application/services/auth.service';

import { CreateUser, FindByEmail } from '@/modules/user/domain/services';
import { User } from '@/modules/user/domain/entities/user.entity';

import { getStatus, MyResponse } from '@/common/response/api';
import { BcryptService } from '@/shared/bcrypt';
import { RedisService } from '@/shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let findByEmail: FindByEmail;
  let createUser: CreateUser;
  let bcrypt: BcryptService;
  let res: Response;
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

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn(),
    json: jest.fn(),
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
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    findByEmail = module.get<FindByEmail>(FindByEmail);
    createUser = module.get<CreateUser>(CreateUser);
    bcrypt = module.get<BcryptService>(BcryptService);
    res = mockResponse as unknown as Response;
    redis = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(createUser).toBeDefined();
    expect(bcrypt).toBeDefined();
    expect(redis).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('Register User', () => {
    it('Should success register user', async () => {
      const response = MyResponse(HttpStatus.CREATED, 'Register Successfully', {
        id,
      });

      mockFindByEmail.execute.mockResolvedValue(null);
      mockBecryptService.hashPassword.mockResolvedValue(hashedPassword);
      mockCreateUSer.execute.mockResolvedValue(newUser);

      const result = await controller.register({ username, email, password });

      expect(result).toEqual(response);
      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockCreateUSer.execute).toHaveBeenCalledWith(data);
    });

    it('Should error register user', async () => {
      const response = {
        code: HttpStatus.BAD_REQUEST,
        status: getStatus(HttpStatus.BAD_REQUEST),
        error: 'Email has already been registered',
      };

      mockFindByEmail.execute.mockResolvedValue(newUser);

      await expect(controller.register(data)).rejects.toThrow(
        new BadRequestException(response.error),
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
      const response = MyResponse(HttpStatus.OK, 'Login Successfully', null);

      mockFindByEmail.execute.mockResolvedValue(newUser);
      mockBecryptService.comparePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce(access_token);
      mockJwtService.signAsync.mockResolvedValueOnce(refresh_token);
      mockResponse.cookie.mockResolvedValueOnce(access_token);
      mockResponse.cookie.mockResolvedValueOnce(refresh_token);
      mockRedisService.set.mockResolvedValueOnce(redisAccessToken);
      mockRedisService.set.mockResolvedValueOnce(redisRefreshToken);

      const result = await controller.login(login, res);

      expect(result).toEqual(mockResponse.status(HttpStatus.OK).json(response));
      expect(mockFindByEmail.execute).toHaveBeenCalledWith(email);
      expect(mockBecryptService.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        1,
        redisAccessToken,
        access_token,
        60 * 60,
      );
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        2,
        redisRefreshToken,
        refresh_token,
        7 * 24 * 60 * 60,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        expiresIn: '1h',
        secret: configService.get('ACCESS_TOKEN_SECRET'),
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
        secret: configService.get('REFRESH_TOKEN_SECRET'),
      });
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        access_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60,
          path: '/',
        },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        refresh_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        },
      );
    });

    it('Should error email not registered, login with invalid creadentials', async () => {
      const response = {
        code: HttpStatus.BAD_REQUEST,
        status: getStatus(HttpStatus.BAD_REQUEST),
        error: 'Email not registered',
      };

      mockFindByEmail.execute.mockResolvedValue(null);

      await expect(controller.login(login, res)).rejects.toThrow(
        response.error,
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
      const response = {
        code: HttpStatus.UNAUTHORIZED,
        status: getStatus(HttpStatus.UNAUTHORIZED),
        error: 'Wrong password',
      };

      mockFindByEmail.execute.mockResolvedValue(newUser);
      mockBecryptService.comparePassword.mockResolvedValue(false);

      await expect(controller.login(login, res)).rejects.toThrow(
        response.error,
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
