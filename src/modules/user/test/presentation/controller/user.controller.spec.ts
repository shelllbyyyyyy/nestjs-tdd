import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';

import { UserController } from '@/modules/user/presentation/controllers/user.controller';
import { UserService } from '@/modules/user/application/services/user.service';
import { User } from '@/modules/user/domain/entities/user.entity';
import { getStatus, MyResponse } from '@/common/response/api';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '@/common/exceptions/http.exception.filter';
import {
  CreateUser,
  FindByEmail,
  FindById,
} from '@/modules/user/domain/services';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let findById: FindById;
  let findByEmail: FindByEmail;

  const mockFindById = {
    execute: jest.fn(),
  };

  const mockFindByEmail = {
    execute: jest.fn(),
  };

  const mockCreateUser = {
    execute: jest.fn(),
  };

  const id = randomUUID();
  const data = {
    username: 'luzma',
    email: 'luzmacantik@gmail.com',
    password: '12345678',
  };

  const newUser = User.create({ id, ...data });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: FindById,
          useValue: mockFindById,
        },
        {
          provide: FindByEmail,
          useValue: mockFindByEmail,
        },
      ],
    })
      .overrideFilter(HttpExceptionFilter)
      .useClass(HttpExceptionFilter)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    findById = module.get<FindById>(FindById);
    findByEmail = module.get<FindByEmail>(FindByEmail);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(findById).toBeDefined();
  });
});
