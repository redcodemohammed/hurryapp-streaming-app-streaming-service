import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

export class ServicesConfig {
  @IsString()
  auth: string;
}

export const servicesConfig = registerAs('services', () => {
  const data = { url: process.env.AUTH_SERVICE_URL };

  return data;
});
