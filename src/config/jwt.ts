import { registerAs } from '@nestjs/config';
import { validate } from './validate';
import { IsString } from 'class-validator';

class JWTConfig {
  @IsString()
  accessTokenExpireTime: string;
  @IsString()
  accessTokenSecret: string;
  @IsString()
  refreshTokenSecret: string;
}

export const jwtConfig = registerAs('jwt', () => {
  const data = {
    accessTokenExpireTime: process.env.ACCESS_TOKEN_EXPIRE_TIME,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  };

  validate(data, JWTConfig);

  return data;
});
