import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationClientService } from './notification-client.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let clientMock: Partial<NotificationClientService>;

  beforeEach(async () => {
    clientMock = {
      sendNotification: jest.fn().mockResolvedValue({
        success: true,
        message: 'Notification enqueued successfully',
        notificationId: 'notif_1725267890123_4a9b',
        idempotencyStatus: 'PROCESSED',
        enqueuedChannels: [
          { channel: 'EMAIL', queue: 'email_critical', jobId: 'job_email_1' },
          { channel: 'PUSH', queue: 'push_critical', jobId: 'job_push_1' },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationClientService, useValue: clientMock },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send welcome email & push notification on user registration', async () => {
    await service.sendWelcomeNotification({
      id: 'usr_123',
      email: 'traveler@example.com',
      name: 'Alex Wanderer',
    });

    expect(clientMock.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'CRITICAL',
        channels: ['EMAIL', 'PUSH'],
        recipient: expect.objectContaining({
          userId: 'usr_123',
          email: 'traveler@example.com',
        }),
      }),
    );
  });

  it('should send trip confirmation dual-channel notification with styled itinerary', async () => {
    await service.sendTripCreatedNotification(
      { id: 'usr_123', email: 'traveler@example.com', name: 'Alex' },
      {
        _id: 'trip_999',
        destination: 'Kyoto, Japan',
        startDate: '2026-10-15',
        endDate: '2026-10-20',
        numberOfDays: 5,
        budget: 1500,
        itinerary: [{ day: 1, theme: 'Ancient Temples' }],
      },
    );

    expect(clientMock.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: 'trip_created_trip_999',
        channels: ['EMAIL', 'PUSH'],
      }),
    );
  });
});
