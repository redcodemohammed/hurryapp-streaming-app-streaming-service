import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @IsString()
  @ApiProperty({
    description: 'Google code',
    example: '4/0AY0e-g7z9jx4XyW2d0K2X1UxvY3mH8kYQ8g8n2Z',
  })
  code: string;
}
