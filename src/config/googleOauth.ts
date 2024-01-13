import { registerAs } from '@nestjs/config';
import { validate } from './validate';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

class GoogleOAuthConfig {
  @IsString()
  @IsOptional()
  clientId: string;
  @IsString()
  @IsOptional()
  clientSecret: string;
  @IsString()
  @IsOptional()
  redirectUri: string;
  @IsBoolean()
  enabled: boolean;
}

export const googleOAuthConfig = registerAs('googleOauth', () => {
  const data = {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    enabled: process.env.GOOGLE_OAUTH_ENABLE === 'true',
  };

  validate(data, GoogleOAuthConfig);

  return data;
});
