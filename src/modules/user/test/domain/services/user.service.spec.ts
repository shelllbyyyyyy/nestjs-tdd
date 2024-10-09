import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';

import {
  CreateUser,
  FindByEmail,
  FindById,
} from '@/modules/user/domain/services';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { User } from '@/modules/user/domain/entities/user.entity';

describe('UserService', () => {
  let findById: FindById;
  let findByEmail: FindByEmail;
  let createUser: CreateUser;
  let userRepository: UserRepository;

  const id = randomUUID();
  const data = {
    username: 'luzma',
    email: 'luzmacantik@gmail.com',
    password: '12345678',
  };

  const newUser = User.create({ id, ...data });

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByEmail,
        FindById,
        CreateUser,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    findById = module.get<FindById>(FindById);
    findByEmail = module.get<FindByEmail>(FindByEmail);
    createUser = module.get<CreateUser>(CreateUser);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(findById).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(createUser).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('Create User', () => {
    it('Should create user success', async () => {
      mockUserRepository.create.mockResolvedValue(newUser);

      const result = await createUser.execute(newUser);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });

  describe('Find User By Email', () => {
    it('Should success retrieve user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(newUser);

      const result = await findByEmail.execute(data.email);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(data.email);
    });
  });

  describe('Find User By Id', () => {
    it('Should success retrieve user', async () => {
      mockUserRepository.findById.mockResolvedValue(newUser);

      const result = await findById.execute(id);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
