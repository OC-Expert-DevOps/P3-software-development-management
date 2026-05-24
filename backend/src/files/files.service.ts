import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadFileDto } from './dto/upload-file.dto';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(private prisma: PrismaService) {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto, userId: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB || '1024', 10)) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(`File size exceeds the limit of ${maxSizeBytes / 1024 / 1024} MB`);
    }

    const originalExtension = path.extname(file.originalname).toLowerCase();
    const forbiddenExtensions = [
      '.exe', '.bat', '.sh', '.cmd', '.msi', '.vbs', '.js', '.ts', '.php', '.phtml', '.py'
    ];
    if (forbiddenExtensions.includes(originalExtension)) {
      throw new BadRequestException('Executable files are not allowed');
    }

    const token = crypto.randomUUID();
    // Protection basique contre le path traversal même si le token est un UUID généré
    const safeFilename = path.basename(token);
    const filePath = path.join(this.uploadDir, safeFilename);

    // Vérification stricte que le chemin résolu reste dans uploadDir
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
      throw new InternalServerErrorException('Invalid file path detected');
    }

    try {
      fs.writeFileSync(resolvedPath, file.buffer);
    } catch (error) {
      throw new InternalServerErrorException('Failed to save file to disk');
    }

    let passwordHash = null;
    if (uploadFileDto.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      passwordHash = await bcrypt.hash(uploadFileDto.password, saltRounds);
    }

    const expiresInDays = uploadFileDto.expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    try {
      const savedFile = await this.prisma.file.create({
        data: {
          userId,
          originalName: file.originalname,
          storedName: token,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          token,
          passwordHash,
          expiresAt,
          tags: uploadFileDto.tags ? {
            create: uploadFileDto.tags.map(name => ({ name })),
          } : undefined,
        },
        include: {
          tags: true,
        },
      });

      return {
        id: savedFile.id,
        token: savedFile.token,
        originalName: savedFile.originalName,
        expiresAt: savedFile.expiresAt,
        tags: savedFile.tags.map(t => t.name),
      };
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new InternalServerErrorException('Failed to save file metadata to database');
    }
  }
}
