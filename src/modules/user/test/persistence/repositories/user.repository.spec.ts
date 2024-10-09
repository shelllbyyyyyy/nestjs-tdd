import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';

import { User } from '@/modules/user/domain/entities/user.entity';

import { UserRepository } from '@/modules/user/domain/repositories/user.repository';

describe('UserController', () => {
  let repository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
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
      providers: [
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Create User', () => {
    it('Should success creating user', async () => {
      mockUserRepository.create.mockResolvedValue(newUser);

      const result = await repository.create(newUser);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUser);
    });

    it('Should error creating user', async () => {
      mockUserRepository.create.mockResolvedValue(null);

      const result = await repository.create(newUser);

      expect(result).toBeNull();
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUser);
    });
  });

  describe('Find User By Email', () => {
    it('Should success retrive user by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(newUser);

      const result = await repository.findByEmail(data.email);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(data.email);
    });

    it('Should error retrieve user by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await repository.findByEmail(data.email);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(data.email);
    });
  });

  describe('Find User By Id', () => {
    it('Should success retrive user by id', async () => {
      mockUserRepository.findById.mockResolvedValue(newUser);

      const result = await repository.findById(id);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(id);
    });

    it('Should error retrieve user by Id', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await repository.findById(id);

      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
