import { ApiProperty } from '@nestjs/swagger';

export class TokensEntity {
  @ApiProperty({
    description: 'Access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
  })
  refreshToken: string;
}
