import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadVideoDto } from 'src/videos/dto';

@Injectable()
export class UploadService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadVideo(
    video: Express.Multer.File,
    cover: Express.Multer.File,
    dto: UploadVideoDto,
    user: User,
  ) {
    return await this.prismaService.video.create({
      data: {
        cover: cover.filename,
        filename: video.filename,
        title: dto.title,
        filesize: video.size,
        userId: user.id,
        mime: video.mimetype,
      },
    });
  }

  async findVideo(id: number) {
    try {
      return await this.prismaService.video.findUniqueOrThrow({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Video not found');
    }
  }

  getVideoFilePath(filename: string): string {
    return `/tmp/uploads/videos/${filename}`;
  }
}
