import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DestinationsService } from './destinations.service';
import { Destination } from './schemas/destination.schema';
import { RedisService } from '../redis/redis.service';

describe('DestinationsService', () => {
  let service: DestinationsService;
  let mockDestinationModel: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockDestinationModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([
                { name: 'Kyoto', slug: 'kyoto', country: 'Japan', averageDailyCost: 140 },
              ]),
            }),
          }),
        }),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          name: 'Kyoto',
          slug: 'kyoto',
          country: 'Japan',
          averageDailyCost: 140,
        }),
      }),
      insertMany: jest.fn().mockResolvedValue([]),
    };

    mockRedisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinationsService,
        { provide: getModelToken(Destination.name), useValue: mockDestinationModel },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<DestinationsService>(DestinationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should query destinations from MongoDB and cache the response in Redis', async () => {
    const result = await service.findAll({ query: 'Japan' });
    expect(result.items.length).toBe(1);
    expect(mockRedisService.set).toHaveBeenCalled();
  });

  it('should return cached result if found in Redis', async () => {
    mockRedisService.get = jest.fn().mockResolvedValue(
      JSON.stringify({ items: [{ name: 'Cached Kyoto' }], total: 1, page: 1, limit: 12 }),
    );

    const result = await service.findAll({ query: 'Japan' });
    expect(result.items[0].name).toBe('Cached Kyoto');
    expect(mockDestinationModel.find).not.toHaveBeenCalled();
  });
});
