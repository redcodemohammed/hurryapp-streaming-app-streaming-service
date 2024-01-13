import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { databaseConfig } from 'src/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor() {}

  async onModuleInit() {
    this.redisClient = new Redis(databaseConfig().redis);
  }

  async onModuleDestroy() {
    await this.redisClient.disconnect();
  }

  // Example method to get a value by key
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  // Example method to set a key-value pair
  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async sadd(key: string, value: string): Promise<void> {
    await this.redisClient.sadd(key, value);
  }

  async srem(key: string, value: string): Promise<void> {
    await this.redisClient.srem(key, value);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    await this.redisClient.ltrim(key, start, stop);
  }

  async lpush(key: string, value: string): Promise<void> {
    await this.redisClient.lpush(key, value);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisClient.lrange(key, start, stop);
  }
}
