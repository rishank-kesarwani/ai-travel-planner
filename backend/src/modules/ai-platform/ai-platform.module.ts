import { Module, forwardRef } from '@nestjs/common';
import { AiPlatformClient } from './ai-platform.client';
import { AiWorkflowService } from './ai-workflow.service';
import { AiChatService } from './ai-chat.service';
import { AiController } from './ai.controller';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ToolsModule,
    UsersModule,
  ],
  controllers: [AiController],
  providers: [AiPlatformClient, AiWorkflowService, AiChatService],
  exports: [AiPlatformClient, AiWorkflowService, AiChatService],
})
export class AiPlatformModule {}
