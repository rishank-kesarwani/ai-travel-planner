import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AiPlatformClient } from '../../ai-platform/ai-platform.client';
import { QUEUES } from '../queue-producer.service';

@Injectable()
export class TripIndexingProcessor implements OnModuleInit {
  private readonly logger = new Logger(TripIndexingProcessor.name);
  private worker: Worker | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiClient: AiPlatformClient,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    try {
      this.worker = new Worker(
        QUEUES.TRIP_INDEXING,
        async (job: Job) => {
          return this.process(job);
        },
        {
          connection: {
            host,
            port,
            password: password || undefined,
            db,
            maxRetriesPerRequest: null,
          },
          concurrency: 5,
        },
      );

      this.worker.on('completed', (job) => {
        this.logger.log(`Job ${job.id} on queue ${QUEUES.TRIP_INDEXING} completed.`);
      });

      this.worker.on('failed', (job, err) => {
        this.logger.error(`Job ${job?.id} failed with error: ${err.message}`);
      });
    } catch (err) {
      this.logger.warn(`TripIndexing worker initialization skipped: ${err.message}`);
    }
  }

  async process(job: Job): Promise<any> {
    const { tripId, userId, destination, itinerary, interests } = job.data;
    this.logger.log(`[BullMQ Worker] Ingesting trip ${tripId} into AI Platform RAG vector index...`);

    const content = `User Trip to ${destination}. Interests: ${(interests || []).join(', ')}. Itinerary Summary: ${JSON.stringify(itinerary)}`;

    await this.aiClient.ingestRagDocument({
      applicationId: 'ai-travel-planner',
      userId,
      visibility: 'private',
      documentId: `trip-${tripId}`,
      title: `Personal Trip Itinerary to ${destination}`,
      content,
      category: 'user_trip_history',
      metadata: {
        tripId,
        destination,
      },
    });

    return { indexed: true, tripId };
  }
}
