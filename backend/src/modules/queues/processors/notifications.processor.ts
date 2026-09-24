import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from '../queue-producer.service';
import { NotificationClientService } from '../../notifications/notification-client.service';

@Injectable()
export class NotificationsProcessor implements OnModuleInit {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private worker: Worker | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationClient: NotificationClientService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    try {
      this.worker = new Worker(
        QUEUES.NOTIFICATIONS,
        async (job: Job) => {
          this.logger.log(`[BullMQ Worker] Dispatching notification job ${job.id} for user ${job.data.userId}...`);

          await this.notificationClient.sendNotification({
            idempotencyKey: `bullmq_${job.id}_${Date.now()}`,
            priority: job.data.priority || 'CRITICAL',
            channels: job.data.channels || ['EMAIL', 'PUSH'],
            recipient: {
              userId: job.data.userId,
              email: job.data.email,
              pushToken: job.data.pushToken || `push_token_${job.data.userId}`,
            },
            email: job.data.emailPayload,
            push: job.data.pushPayload,
            metadata: job.data.metadata,
          });

          return { sent: true, jobId: job.id };
        },
        {
          connection: { host, port, password: password || undefined, db, maxRetriesPerRequest: null },
        },
      );
    } catch (e) {}
  }
}
