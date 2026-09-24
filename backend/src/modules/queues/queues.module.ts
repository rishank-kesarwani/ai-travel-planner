import { Global, Module } from '@nestjs/common';
import { QueueProducerService } from './queue-producer.service';
import { TripIndexingProcessor } from './processors/trip-indexing.processor';
import { ExternalApiSyncProcessor } from './processors/external-api-sync.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { AiPlatformModule } from '../ai-platform/ai-platform.module';

@Global()
@Module({
  imports: [AiPlatformModule],
  providers: [
    QueueProducerService,
    TripIndexingProcessor,
    ExternalApiSyncProcessor,
    NotificationsProcessor,
  ],
  exports: [QueueProducerService],
})
export class QueuesModule {}
