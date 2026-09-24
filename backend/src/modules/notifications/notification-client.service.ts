import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IngestNotificationPayload,
  NotificationResponse,
} from './interfaces/notification.interface';

@Injectable()
export class NotificationClientService {
  private readonly logger = new Logger(NotificationClientService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'notificationService.url',
      'http://localhost:3001',
    );
    this.apiKey = this.configService.get<string>(
      'notificationService.apiKey',
      'test-api-key-12345',
    );

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  async sendNotification(
    payload: IngestNotificationPayload,
  ): Promise<NotificationResponse | null> {
    try {
      this.logger.log(
        `[Notification Service] Dispatching ${payload.channels.join(',')} notification to user ${payload.recipient.userId} (Key: ${payload.idempotencyKey})`,
      );

      const response = await this.client.post<NotificationResponse>(
        '/v1/notifications',
        payload,
      );

      this.logger.log(
        `[Notification Service] Success! Notification ID: ${response.data.notificationId} enqueued across: ${response.data.enqueuedChannels?.map((c) => c.queue).join(', ')}`,
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[Notification Service] Warning: Notification dispatch to ${this.baseUrl}/v1/notifications failed (${err.message}). Notification handled gracefully.`,
      );
      return null;
    }
  }

  async syncUserPreferences(
    userId: string,
    prefs: { bulkOptOut?: boolean; pushOptOut?: boolean },
  ): Promise<boolean> {
    try {
      await this.client.put(`/v1/preferences/${userId}`, prefs);
      return true;
    } catch (err: any) {
      this.logger.debug(
        `User preference sync to notification service notice: ${err.message}`,
      );
      return false;
    }
  }

  async getMetrics(): Promise<any> {
    try {
      const res = await this.client.get('/metrics');
      return res.data;
    } catch (err: any) {
      return { status: 'offline', message: err.message };
    }
  }
}
