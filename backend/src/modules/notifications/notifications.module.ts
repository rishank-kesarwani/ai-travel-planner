import { Global, Module } from '@nestjs/common';
import { NotificationClientService } from './notification-client.service';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationClientService, NotificationService],
  exports: [NotificationClientService, NotificationService],
})
export class NotificationsModule {}
