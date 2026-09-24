import { Test, TestingModule } from '@nestjs/testing';
import { ToolsService } from './tools.service';
import { DestinationsService } from '../destinations/destinations.service';
import { WeatherService } from '../weather/weather.service';
import { UsersService } from '../users/users.service';
import { TripsService } from '../trips/trips.service';

describe('ToolsService', () => {
  let toolsService: ToolsService;
  let mockDestinationsService: any;
  let mockWeatherService: any;
  let mockUsersService: any;
  let mockTripsService: any;

  beforeEach(async () => {
    mockDestinationsService = {
      findAll: jest.fn().mockResolvedValue({
        items: [{ name: 'Kyoto', slug: 'kyoto', country: 'Japan', averageDailyCost: 140, tags: ['culture'] }],
      }),
      findBySlugOrId: jest.fn().mockResolvedValue({
        name: 'Kyoto',
        country: 'Japan',
        averageDailyCost: 140,
        topAttractions: [{ name: 'Fushimi Inari', costUsd: 0, estimatedTimeHours: 3 }],
      }),
    };

    mockWeatherService = {
      getWeather: jest.fn().mockResolvedValue({
        location: 'Kyoto',
        temperatureC: 18,
        condition: 'Sunny',
      }),
    };

    mockUsersService = {
      findById: jest.fn().mockResolvedValue({
        name: 'Jane Traveler',
        preferences: { budgetRange: 'moderate' },
      }),
    };

    mockTripsService = {
      create: jest.fn().mockResolvedValue({ _id: 'saved_trip_123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolsService,
        { provide: DestinationsService, useValue: mockDestinationsService },
        { provide: WeatherService, useValue: mockWeatherService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: TripsService, useValue: mockTripsService },
      ],
    }).compile();

    toolsService = module.get<ToolsService>(ToolsService);
  });

  it('should be defined and return valid tool schemas', () => {
    expect(toolsService).toBeDefined();
    const defs = toolsService.getAvailableToolDefinitions();
    expect(defs.length).toBeGreaterThanOrEqual(8);
    expect(defs.some((d) => d.name === 'calculateBudget')).toBe(true);
  });

  it('should calculate budget correctly for given days and travelers', async () => {
    const result = await toolsService.executeTool('calculateBudget', {
      destination: 'Kyoto',
      numberOfDays: 5,
      travelers: 2,
      budgetTier: 'moderate',
      userBudget: 2000,
    });

    expect(result.destination).toBe('Kyoto');
    expect(result.numberOfDays).toBe(5);
    expect(result.totalEstimatedUsd).toBeGreaterThan(0);
    expect(result.breakdown).toBeDefined();
  });

  it('should retrieve weather accurately', async () => {
    const result = await toolsService.executeTool('getWeather', { location: 'Kyoto' });
    expect(result.temperatureC).toBe(18);
  });
});
