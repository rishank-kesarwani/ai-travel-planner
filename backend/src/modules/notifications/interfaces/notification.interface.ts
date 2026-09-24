export interface RecipientInfo {
  userId: string;
  email: string;
  pushToken?: string;
}

export interface EmailPayload {
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export interface PushPayload {
  title: string;
  body: string;
}

export interface IngestNotificationPayload {
  idempotencyKey: string;
  priority: 'CRITICAL' | 'BULK';
  channels: Array<'EMAIL' | 'PUSH'>;
  recipient: RecipientInfo;
  email?: EmailPayload;
  push?: PushPayload;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notificationId: string;
  idempotencyStatus: 'PENDING' | 'PROCESSED';
  enqueuedChannels: Array<{
    channel: 'EMAIL' | 'PUSH';
    queue: string;
    jobId: string;
  }>;
}
