import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private inMemoryFallback = new Map<string, { value: string; expiresAt?: number }>();
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        db,
        maxRetriesPerRequest: 2,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn(
              'Redis connection failed after 3 attempts. Switching to in-memory fallback.',
            );
            return null;
          }
          return Math.min(times * 100, 1000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Connected to Redis at ${host}:${port}`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn(
          `Redis error (${err.message}). Using in-memory fallback cache.`,
        );
      });
    } catch (err) {
      this.logger.warn(
        `Failed to initialize Redis client. Using in-memory fallback: ${err.message}`,
      );
      this.client = null;
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        this.logger.warn(`Redis get error for key ${key}: ${err.message}`);
      }
    }

    const item = this.inMemoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.inMemoryFallback.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        this.logger.warn(`Redis set error for key ${key}: ${err.message}`);
      }
    }

    this.inMemoryFallback.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        this.logger.warn(`Redis del error for key ${key}: ${err.message}`);
      }
    }
    this.inMemoryFallback.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.keys(pattern);
      } catch (err) {
        this.logger.warn(`Redis keys error for pattern ${pattern}: ${err.message}`);
      }
    }
    // simple prefix match
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.inMemoryFallback.keys()).filter((k) => regex.test(k));
  }

  getClient(): Redis | null {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }
}
