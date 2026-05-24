import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', email: 'test@test.com', passwordHash: 'hash', createdAt: new Date() };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should return null if not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('notfound@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', email: 'test@test.com', passwordHash: 'hash', createdAt: new Date() };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findById('1');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const data: Prisma.UserCreateInput = { email: 'new@test.com', passwordHash: 'hash' };
      const createdUser = { id: '2', ...data, createdAt: new Date() };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser);

      const result = await service.create(data);
      expect(result).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data });
    });
  });
});
