import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationClientService } from './notification-client.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly client: NotificationClientService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('test')
  @ApiOperation({ summary: 'Send a test dual-channel notification (Email + Push) to current user' })
  async sendTestNotification(@CurrentUser() user: AuthUser) {
    await this.notificationService.sendWelcomeNotification({
      id: user.userId,
      email: user.email,
      name: user.name || 'Traveler',
    });
    return { success: true, message: 'Test notification dispatched to notification-service' };
  }

  @Public()
  @Get('metrics')
  @ApiOperation({ summary: 'Get live queues and circuit breaker health from notification service' })
  async getMetrics() {
    return this.client.getMetrics();
  }
}
