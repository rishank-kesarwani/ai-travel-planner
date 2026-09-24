import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AiPlatformModule } from '../ai-platform/ai-platform.module';

@Module({
  imports: [AiPlatformModule],
  controllers: [HealthController],
})
export class HealthModule {}
