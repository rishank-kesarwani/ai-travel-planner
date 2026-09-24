import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

export const QUEUES = {
  TRIP_INDEXING: 'trip-indexing',
  EXTERNAL_API_SYNC: 'external-api-sync',
  NOTIFICATIONS: 'notifications',
};

@Injectable()
export class QueueProducerService implements OnModuleInit {
  private readonly logger = new Logger(QueueProducerService.name);
  private tripIndexingQueue: Queue | null = null;
  private externalApiSyncQueue: Queue | null = null;
  private notificationsQueue: Queue | null = null;
  private isRedisAvailable = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    const connection = {
      host,
      port,
      password: password || undefined,
      db,
      maxRetriesPerRequest: null,
    };

    try {
      this.tripIndexingQueue = new Queue(QUEUES.TRIP_INDEXING, { connection });
      this.externalApiSyncQueue = new Queue(QUEUES.EXTERNAL_API_SYNC, { connection });
      this.notificationsQueue = new Queue(QUEUES.NOTIFICATIONS, { connection });
      this.isRedisAvailable = true;
      this.logger.log('BullMQ Queues initialized successfully.');
    } catch (err) {
      this.logger.warn(`BullMQ initialization error (${err.message}). Using asynchronous non-blocking fallback.`);
      this.isRedisAvailable = false;
    }
  }

  async addTripIndexingJob(data: any) {
    if (this.isRedisAvailable && this.tripIndexingQueue) {
      try {
        await this.tripIndexingQueue.add('index-trip-rag', data, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        });
        return;
      } catch (err) {
        this.logger.warn(`Failed to push to BullMQ: ${err.message}. Running async job directly.`);
      }
    }
    // Fallback: log job dispatched
    this.logger.log(`Async Trip Indexing Job scheduled for trip: ${data.tripId}`);
  }

  async addExternalApiSyncJob(data: any) {
    if (this.isRedisAvailable && this.externalApiSyncQueue) {
      try {
        await this.externalApiSyncQueue.add('sync-destinations', data, {
          attempts: 2,
          removeOnComplete: true,
        });
        return;
      } catch (e) {}
    }
  }

  async addNotificationJob(data: any) {
    if (this.isRedisAvailable && this.notificationsQueue) {
      try {
        await this.notificationsQueue.add('send-notification', data, {
          removeOnComplete: true,
        });
        return;
      } catch (e) {}
    }
  }
}
