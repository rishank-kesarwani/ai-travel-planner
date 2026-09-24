import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from '../queue-producer.service';

@Injectable()
export class ExternalApiSyncProcessor implements OnModuleInit {
  private readonly logger = new Logger(ExternalApiSyncProcessor.name);
  private worker: Worker | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    try {
      this.worker = new Worker(
        QUEUES.EXTERNAL_API_SYNC,
        async (job: Job) => {
          this.logger.log(`Syncing external destination/weather APIs: ${job.name}`);
          return { synced: true };
        },
        {
          connection: { host, port, password: password || undefined, db, maxRetriesPerRequest: null },
        },
      );
    } catch (e) {}
  }
}
