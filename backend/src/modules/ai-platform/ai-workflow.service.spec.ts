import { Test, TestingModule } from '@nestjs/testing';
import { AiWorkflowService } from './ai-workflow.service';
import { AiPlatformClient } from './ai-platform.client';
import { ToolsService } from '../tools/tools.service';
import { UsersService } from '../users/users.service';

describe('AiWorkflowService', () => {
  let workflowService: AiWorkflowService;
  let mockAiClient: any;
  let mockToolsService: any;
  let mockUsersService: any;

  beforeEach(async () => {
    mockAiClient = {
      queryRag: jest.fn().mockResolvedValue({
        documents: [],
        citations: [{ title: 'Kyoto Travel Guide', source: 'RAG Knowledge Base' }],
      }),
      executeWorkflow: jest.fn().mockResolvedValue(null),
    };

    mockToolsService = {
      executeTool: jest.fn().mockImplementation((name, args) => {
        if (name === 'getDestinationDetails') {
          return {
            name: 'Kyoto',
            averageDailyCost: 140,
            topAttractions: [{ name: 'Fushimi Inari', costUsd: 0, estimatedTimeHours: 3 }],
          };
        }
        if (name === 'calculateBudget') {
          return {
            totalEstimatedUsd: 1200,
            isWithinUserBudget: true,
            breakdown: { accommodationTotalUsd: 600 },
          };
        }
        if (name === 'getWeather') {
          return { condition: 'Sunny', temperatureC: 20 };
        }
        return {};
      }),
    };

    mockUsersService = {
      findById: jest.fn().mockResolvedValue({
        name: 'Alex',
        preferences: { walkingTolerance: 'moderate', foodPreferences: ['vegetarian'] },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiWorkflowService,
        { provide: AiPlatformClient, useValue: mockAiClient },
        { provide: ToolsService, useValue: mockToolsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    workflowService = module.get<AiWorkflowService>(AiWorkflowService);
  });

  it('should be defined', () => {
    expect(workflowService).toBeDefined();
  });

  it('should execute the LangGraph conceptual itinerary workflow with RAG & tool steps', async () => {
    const result = await workflowService.generateTripItinerary({
      userId: '507f1f77bcf86cd799439011',
      destination: 'Kyoto',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      numberOfDays: 5,
      budget: 1500,
    });

    expect(result.destination).toBe('Kyoto');
    expect(result.itinerary.length).toBe(5);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.workflowStepsCompleted.length).toBe(8);
  });
});
