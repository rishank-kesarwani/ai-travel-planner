import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { AiPlatformClient } from '../ai-platform/ai-platform.client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
    private readonly aiClient: AiPlatformClient,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'System health check' })
  async checkHealth() {
    const mongoState = this.mongoConnection.readyState === 1 ? 'connected' : 'disconnected';
    const redisState = this.redisService.getClient() ? 'connected' : 'in-memory-fallback';
    const aiPlatformState = (await this.aiClient.isHealthy()) ? 'connected' : 'standby-fallback';

    const isHealthy = mongoState === 'connected' || this.mongoConnection.readyState === 2;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      service: 'ai-travel-planner-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dependencies: {
        mongodb: mongoState,
        redis: redisState,
        aiPlatform: aiPlatformState,
      },
    };
  }
}
