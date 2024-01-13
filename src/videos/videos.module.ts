import { Module } from '@nestjs/common';
import { UploadService } from './services/upload/upload.service';
import { VideosController } from './videos.controller';

@Module({
  providers: [UploadService],
  controllers: [VideosController],
})
export class VideosModule {}
