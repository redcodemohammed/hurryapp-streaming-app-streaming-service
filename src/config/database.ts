import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { validate } from './validate';

class DatabaseConfig {
  @IsString()
  url: string;
}

export const databaseConfig = registerAs('database', () => {
  const data = { url: process.env.DATABASE_URL };

  validate(data, DatabaseConfig);
  return data;
});
