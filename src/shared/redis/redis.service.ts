import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { Callback, RedisKey } from 'ioredis';

import { REDIS_CONNECTION } from '../constant';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  async onModuleDestroy() {
    this.redis.disconnect();
  }

  async set(key: RedisKey, value: string | Buffer | number, exp: number) {
    return await this.redis.set(key, value, 'EX', exp);
  }

  async get(key: RedisKey, callback?: Callback<string | null>) {
    return await this.redis.get(key, callback);
  }

  async del(key: RedisKey) {
    return await this.redis.del(key);
  }
}
