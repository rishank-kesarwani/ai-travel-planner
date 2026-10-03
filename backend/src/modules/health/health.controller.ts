import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { AiPlatformClient } from '../ai-platform/ai-platform.client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
    private readonly aiClient: AiPlatformClient,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API Root & Status Information' })
  getRoot() {
    return {
      name: 'AI Travel Planner Backend API',
      status: 'online',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/health',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Lightweight process health and liveness check for Render' })
  getLiveness() {
    return {
      status: 'ok',
      service: 'ai-travel-planner-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('api/v1/health')
  @ApiOperation({ summary: 'System detailed dependency health check' })
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
