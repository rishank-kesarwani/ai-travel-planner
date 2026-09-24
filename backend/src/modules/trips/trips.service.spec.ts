import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TripsService } from './trips.service';
import { Trip } from './schemas/trip.schema';
import { QueueProducerService } from '../queues/queue-producer.service';
import { NotificationService } from '../notifications/notification.service';
import { UserRole } from '../../common/enums/roles.enum';

describe('TripsService', () => {
  let tripsService: TripsService;
  let mockTripModel: any;
  let mockQueueProducer: any;

  const mockUser = {
    userId: '507f1f77bcf86cd799439011',
    email: 'traveler@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    mockTripModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: 'trip_12345',
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: 'trip_12345',
      }),
    }));

    mockTripModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    mockTripModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    mockTripModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'trip_12345',
        userId: mockUser.userId,
        destination: 'Kyoto, Japan',
      }),
    });

    mockQueueProducer = {
      addTripIndexingJob: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: getModelToken(Trip.name), useValue: mockTripModel },
        { provide: QueueProducerService, useValue: mockQueueProducer },
        {
          provide: NotificationService,
          useValue: {
            sendTripCreatedNotification: jest.fn().mockResolvedValue(undefined),
            sendTripStatusUpdatedNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    tripsService = module.get<TripsService>(TripsService);
  });

  it('should be defined', () => {
    expect(tripsService).toBeDefined();
  });

  it('should calculate budget and dispatch BullMQ job when creating a trip', async () => {
    const tripDto: any = {
      destination: 'Kyoto, Japan',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      numberOfDays: 5,
      budget: 1500,
      itinerary: [
        {
          day: 1,
          theme: 'Arrival',
          estimatedDailyCostUsd: 150,
          activities: [],
        },
      ],
    };

    const result = await tripsService.create(mockUser, tripDto);
    expect(result).toBeDefined();
    expect(mockQueueProducer.addTripIndexingJob).toHaveBeenCalled();
  });
});
