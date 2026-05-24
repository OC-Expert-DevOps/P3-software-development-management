import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadFileDto } from './dto/upload-file.dto';
import { DownloadFileDto } from './dto/download-file.dto';
import { Get, Param, StreamableFile, Res, HttpCode, Delete, Query } from '@nestjs/common';
import type { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.uploadFile(file, uploadFileDto, user.id);
  }

  @Post('upload/anonymous')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAnonymousFile(
    @UploadedFile() file: any,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    return this.filesService.uploadFile(file, uploadFileDto);
  }

  @Get('download/:token')
  async getFileMetadata(@Param('token') token: string) {
    return this.filesService.getFileMetadata(token);
  }

  @Post('download/:token/file')
  @HttpCode(200)
  async downloadFile(
    @Param('token') token: string,
    @Body() downloadFileDto: DownloadFileDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, fileInfo } = await this.filesService.getFileStream(token, downloadFileDto);
    
    res.set({
      'Content-Type': fileInfo.mimeType,
      'Content-Disposition': `attachment; filename="${fileInfo.originalName}"`,
      'Content-Length': fileInfo.sizeBytes.toString(),
    });

    return new StreamableFile(stream);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserFiles(
    @CurrentUser() user: { id: string },
    @Query('tag') tag?: string,
  ) {
    return this.filesService.getUserFiles(user.id, tag);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUserFile(
    @CurrentUser() user: { id: string },
    @Param('id') fileId: string,
  ) {
    return this.filesService.deleteUserFile(user.id, fileId);
  }
}
