import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadVideoDto {
  @ApiProperty({ type: 'File', format: 'binary' })
  video: any;

  @ApiProperty({ type: 'File', format: 'binary' })
  cover: any;

  @ApiProperty()
  @IsString()
  title: string;
}
