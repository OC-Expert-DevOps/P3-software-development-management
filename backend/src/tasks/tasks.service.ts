import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly uploadDir: string;

  constructor(private prisma: PrismaService) {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  }

  // Cron execution à minuit tous les jours (0 0 * * *)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredFiles() {
    this.logger.log('Starting cleanup of expired files...');

    const expiredFiles = await this.prisma.file.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (expiredFiles.length === 0) {
      this.logger.log('No expired files found to cleanup.');
      return;
    }

    let deletedCount = 0;
    let failedCount = 0;

    for (const file of expiredFiles) {
      try {
        const safeFilename = path.basename(file.storedName);
        const filePath = path.join(this.uploadDir, safeFilename);
        const resolvedPath = path.resolve(filePath);

        // Verification de sécurité de base pour pas remove n'importe quoi
        if (resolvedPath.startsWith(path.resolve(this.uploadDir)) && fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }

        await this.prisma.file.delete({
          where: { id: file.id },
        });

        deletedCount++;
      } catch (error: any) {
        this.logger.error(`Failed to delete file ${file.id}: ${error?.message || 'Unknown error'}`);
        failedCount++;
      }
    }

    this.logger.log(`Cleanup completed. Deleted: ${deletedCount}, Failed: ${failedCount}`);
  }
}
