import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

export class DatabaseConfig {
  @IsString()
  host: string;
}

export const databaseConfig = registerAs('database', () => {
  const data = { url: process.env.DATABASE_URL };

  // validate(data, DatabaseConfig);
  return data;
});
