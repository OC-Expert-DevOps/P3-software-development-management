import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', createdAt: new Date() });
      await expect(service.register({ email: 'test@test.com', password: 'password123' })).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jest.spyOn(usersService, 'create').mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hashedPassword', createdAt: new Date() });
      jest.spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register({ email: 'test@test.com', password: 'password123' });

      expect(usersService.create).toHaveBeenCalledWith({ email: 'test@test.com', passwordHash: 'hashedPassword' });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' },
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      await expect(service.login({ email: 'test@test.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', createdAt: new Date() });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if login successful', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', createdAt: new Date() });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' },
      });
    });
  });
});
