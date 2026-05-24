import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { DownloadFileDto } from './dto/download-file.dto';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException, GoneException, ForbiddenException } from '@nestjs/common';

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

  async getFileMetadata(token: string) {
    const file = await this.prisma.file.findUnique({
      where: { token },
      include: { tags: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.expiresAt < new Date()) {
      throw new GoneException('File has expired');
    }

    return {
      token: file.token,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      expiresAt: file.expiresAt,
      isPasswordProtected: !!file.passwordHash,
      tags: file.tags.map(t => t.name),
    };
  }

  async getFileStream(token: string, downloadFileDto: DownloadFileDto) {
    const file = await this.prisma.file.findUnique({
      where: { token },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.expiresAt < new Date()) {
      throw new GoneException('File has expired');
    }

    if (file.passwordHash) {
      if (!downloadFileDto.password) {
        throw new UnauthorizedException('Password is required to download this file');
      }
      const isPasswordValid = await bcrypt.compare(downloadFileDto.password, file.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    const safeFilename = path.basename(file.storedName);
    const filePath = path.join(this.uploadDir, safeFilename);

    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
      throw new InternalServerErrorException('Invalid file path detected');
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundException('Physical file not found on server');
    }

    return {
      stream: fs.createReadStream(resolvedPath),
      fileInfo: file,
    };
  }

  async getUserFiles(userId: string, tag?: string) {
    const whereClause: any = {
      userId,
      expiresAt: {
        gt: new Date(), // uniquement les non expirés
      },
    };

    if (tag) {
      whereClause.tags = {
        some: {
          name: tag,
        },
      };
    }

    const files = await this.prisma.file.findMany({
      where: whereClause,
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    });

    return files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      sizeBytes: file.sizeBytes,
      expiresAt: file.expiresAt,
      createdAt: file.createdAt,
      token: file.token, // Pour le lien de partage
      tags: file.tags.map(t => t.name),
      isPasswordProtected: !!file.passwordHash,
    }));
  }

  async deleteUserFile(userId: string, fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    // Suppression physique (si existant)
    const safeFilename = path.basename(file.storedName);
    const filePath = path.join(this.uploadDir, safeFilename);
    const resolvedPath = path.resolve(filePath);
    
    if (resolvedPath.startsWith(path.resolve(this.uploadDir)) && fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }

    // La suppression en BDD supprimera aussi les tags en cascade
    // Prisma gère le onDelete: Cascade s'il a été défini, ou il faut supprimer explicitement les tags si non
    // Pour être safe on delete directement le fichier (le onDelete Cascade est déjà sur le schéma Prisma si bien défini)
    await this.prisma.tag.deleteMany({
      where: { fileId },
    });

    await this.prisma.file.delete({
      where: { id: fileId },
    });

    return { success: true };
  }
}
