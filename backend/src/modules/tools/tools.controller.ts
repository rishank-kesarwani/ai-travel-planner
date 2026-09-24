import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { ServiceAuthGuard } from '../../common/guards/service-auth.guard';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ExecuteToolDto {
  @IsString()
  @IsNotEmpty()
  toolName: string;

  @IsObject()
  parameters: Record<string, any>;

  @IsOptional()
  @IsString()
  userId?: string;
}

@ApiTags('Tools')
@Controller('api/v1/tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get('definitions')
  @ApiOperation({ summary: 'Get list of travel tool schemas for AI Platform' })
  getDefinitions() {
    return this.toolsService.getAvailableToolDefinitions();
  }

  @UseGuards(ServiceAuthGuard)
  @ApiSecurity('x-service-api-key')
  @Post('execute')
  @ApiOperation({ summary: 'Execute travel domain tool (called securely by AI Platform)' })
  async executeTool(@Body() dto: ExecuteToolDto) {
    return this.toolsService.executeTool(dto.toolName, dto.parameters, { userId: dto.userId });
  }
}
