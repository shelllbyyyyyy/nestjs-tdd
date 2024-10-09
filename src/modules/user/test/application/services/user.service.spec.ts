import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from '@/modules/user/application/services/user.service';
import { randomUUID } from 'crypto';
import { User } from '@/modules/user/domain/entities/user.entity';
import {
  CreateUser,
  FindByEmail,
  FindById,
} from '@/modules/user/domain/services';

describe('UserService', () => {
  let service: UserService;
  let findById: FindById;
  let findByEmail: FindByEmail;
  let createUser: CreateUser;

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

  const newUser = new User(id, data.username, data.email, data.password);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        {
          provide: CreateUser,
          useValue: mockCreateUser,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    findById = module.get<FindById>(FindById);
    findByEmail = module.get<FindByEmail>(FindByEmail);
    createUser = module.get<CreateUser>(CreateUser);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(findById).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(createUser).toBeDefined();
  });

  describe('Find User By Email', () => {
    it('Should success find user by email', async () => {
      mockFindByEmail.execute.mockResolvedValue(newUser);

      const result = await service.findOneByEmail(data.email);

      expect(result).toEqual(newUser);

      expect(mockFindByEmail.execute).toHaveBeenCalledWith(data.email);
    });

    it('Should error find user by email', async () => {
      mockFindByEmail.execute.mockResolvedValue(null);

      await expect(service.findOneByEmail(data.email)).rejects.toThrow(
        'Email not registered yet',
      );

      expect(mockFindByEmail.execute).toHaveBeenCalledWith(data.email);
    });
  });

  describe('Find User By Id', () => {
    it('Should success find user by id', async () => {
      mockFindById.execute.mockResolvedValue(newUser);

      const result = await service.findOneById(id);

      expect(result).toEqual(newUser);

      expect(mockFindById.execute).toHaveBeenCalledWith(id);
    });

    it('Should error find user by id', async () => {
      mockFindById.execute.mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow('User not found');

      expect(mockFindById.execute).toHaveBeenCalledWith(id);
    });
  });
});
