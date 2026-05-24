import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

jest.mock('fs');

describe('FilesService', () => {
  let service: FilesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: {
            file: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      buffer: Buffer.from('test content'),
      stream: null as any,
    };

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(service.uploadFile(undefined as any, {}, 'user-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file exceeds size limit', async () => {
      process.env.MAX_FILE_SIZE_MB = '1';
      const largeFile = { ...mockFile, size: 2 * 1024 * 1024 };
      await expect(service.uploadFile(largeFile, {}, 'user-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for forbidden extensions', async () => {
      process.env.MAX_FILE_SIZE_MB = '1024';
      const exeFile = { ...mockFile, originalname: 'malware.exe' };
      await expect(service.uploadFile(exeFile, {}, 'user-id')).rejects.toThrow(BadRequestException);
    });

    it('should upload file and hash password if provided', async () => {
      process.env.MAX_FILE_SIZE_MB = '1024';
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      
      const mockSavedFile = {
        id: 'file-1',
        token: 'mock-uuid-token',
        originalName: 'test.txt',
        expiresAt: new Date(),
        tags: [],
      };
      
      jest.spyOn(prisma.file, 'create').mockResolvedValue(mockSavedFile as any);

      // Pour éviter le mock global de bcrypt qui bug sous Jest/SWC
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password') as any);

      await service.uploadFile(mockFile, { password: 'my-secret-password' }, 'user-id');

      expect(hashSpy).toHaveBeenCalled();
      hashSpy.mockRestore();
    });
  });
});
