import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AiWorkflowService } from './ai-workflow.service';
import { AiChatService } from './ai-chat.service';
import { AiPlatformClient, ChatMessage } from './ai-platform.client';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class GenerateTripPlanDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  travelers?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}

export class ChatDto {
  @IsArray()
  messages: ChatMessage[];

  @IsOptional()
  @IsBoolean()
  useRag?: boolean = true;
}

export class RagQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 4;
}

export class RagIngestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  visibility?: 'public' | 'private' = 'public';
}

@ApiTags('AI Travel Platform')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ai')
export class AiController {
  constructor(
    private readonly aiWorkflowService: AiWorkflowService,
    private readonly aiChatService: AiChatService,
    private readonly aiClient: AiPlatformClient,
  ) {}

  @Post('trips/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate intelligent trip plan via AI Platform LangGraph workflow' })
  async generateTrip(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateTripPlanDto,
  ) {
    return this.aiWorkflowService.generateTripItinerary({
      userId: user.userId,
      ...dto,
    });
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with AI Travel Assistant (Non-streaming)' })
  async chat(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChatDto,
  ) {
    return this.aiChatService.processChat(user.userId, dto.messages, dto.useRag);
  }

  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stream chat with AI Travel Assistant via Server-Sent Events' })
  async streamChat(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChatDto,
    @Res() response: Response,
  ) {
    return this.aiChatService.streamChat(user.userId, dto.messages, response, dto.useRag);
  }

  @Post('rag/query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Query RAG Travel Knowledge Base with tenant and user isolation' })
  async queryRag(
    @CurrentUser() user: AuthUser,
    @Body() dto: RagQueryDto,
  ) {
    return this.aiClient.queryRag({
      applicationId: 'ai-travel-planner',
      userId: user.userId,
      query: dto.query,
      limit: dto.limit,
    });
  }

  @Post('rag/ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest custom travel document into AI Platform RAG vector index' })
  async ingestRag(
    @CurrentUser() user: AuthUser,
    @Body() dto: RagIngestDto,
  ) {
    return this.aiClient.ingestRagDocument({
      applicationId: 'ai-travel-planner',
      userId: dto.visibility === 'private' ? user.userId : undefined,
      visibility: dto.visibility || 'public',
      documentId: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: dto.title,
      content: dto.content,
      category: dto.category,
    });
  }

  @Get('memory')
  @ApiOperation({ summary: 'Get current user persistent memories from AI Platform' })
  async getUserMemory(@CurrentUser() user: AuthUser) {
    return this.aiClient.getUserMemories(user.userId);
  }
}
