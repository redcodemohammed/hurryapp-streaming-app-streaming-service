import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { createReadStream, promises as fs } from 'fs';
import { CurrentUser } from 'src/common/decorators';
import { fileFilter, multerOptions } from 'src/videos/config';
import { UploadVideoDto } from './dto';
import { UploadService } from './services/upload/upload.service';

@Controller('videos')
@ApiTags('videos')
export class VideosController {
  constructor(private readonly uploadService: UploadService) {}
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        dest: '/tmp/uploads',
        storage: multerOptions.storage,
        fileFilter,
      },
    ),
  )
  async upload(
    @UploadedFiles() files,
    @CurrentUser() user: User,
    @Body() dto: UploadVideoDto,
  ) {
    const video = files.video[0]! as Express.Multer.File;
    const cover = files.cover[0]! as Express.Multer.File;

    return this.uploadService.uploadVideo(video, cover, dto, user);
  }

  @Get('/:id')
  async findVideo(@Param('id') id: number) {
    return this.uploadService.findVideo(id);
  }

  @Get('/:id/stream')
  async streamVideo(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const video = await this.uploadService.findVideo(id);
    const videoPath = this.uploadService.getVideoFilePath(video.filename);

    const videoStat = await fs.stat(videoPath);
    const fileSize = videoStat.size;

    const videoRange = req.headers.range;

    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mime,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mime,
      };
      res.writeHead(200, head);
      createReadStream(videoPath).pipe(res);
    }
  }
}
