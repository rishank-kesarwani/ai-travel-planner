import { Injectable, Logger } from '@nestjs/common';
import { DestinationsService } from '../destinations/destinations.service';
import { WeatherService } from '../weather/weather.service';
import { UsersService } from '../users/users.service';
import { TripsService } from '../trips/trips.service';
import { UserRole } from '../../common/enums/roles.enum';

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  constructor(
    private readonly destinationsService: DestinationsService,
    private readonly weatherService: WeatherService,
    private readonly usersService: UsersService,
    private readonly tripsService: TripsService,
  ) {}

  getAvailableToolDefinitions() {
    return [
      {
        name: 'searchDestination',
        description: 'Search for travel destinations by keywords, countries, or tags',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for destination, country, or tag' },
            category: { type: 'string', description: 'Destination category (cultural, nature, beach, city)' },
            maxBudget: { type: 'number', description: 'Maximum average daily cost in USD' },
          },
          required: ['query'],
        },
      },
      {
        name: 'getDestinationDetails',
        description: 'Get in-depth travel destination details, attractions, average daily costs and coordinates',
        parameters: {
          type: 'object',
          properties: {
            destination: { type: 'string', description: 'Destination slug or exact name (e.g., kyoto, santorini)' },
          },
          required: ['destination'],
        },
      },
      {
        name: 'getWeather',
        description: 'Get current weather and 5-day forecast for a city/country',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'Location name or city (e.g. Kyoto, Japan)' },
          },
          required: ['location'],
        },
      },
      {
        name: 'calculateBudget',
        description: 'Calculate detailed estimated budget for a trip considering days, travelers, style and destination cost',
        parameters: {
          type: 'object',
          properties: {
            destination: { type: 'string', description: 'Destination name' },
            numberOfDays: { type: 'number', description: 'Total days' },
            travelers: { type: 'number', description: 'Number of travelers' },
            budgetTier: { type: 'string', enum: ['budget', 'moderate', 'luxury'], description: 'Budget level' },
          },
          required: ['destination', 'numberOfDays', 'travelers'],
        },
      },
      {
        name: 'searchHotels',
        description: 'Search recommended accommodations matching travel style and destination',
        parameters: {
          type: 'object',
          properties: {
            destination: { type: 'string', description: 'Destination name' },
            style: { type: 'string', description: 'Accommodation style (e.g. boutique_hotel, hostel, resort)' },
            budgetPerNightUsd: { type: 'number', description: 'Target nightly budget in USD' },
          },
          required: ['destination'],
        },
      },
      {
        name: 'searchActivities',
        description: 'Find curated activities and sights for a destination filtered by category and interests',
        parameters: {
          type: 'object',
          properties: {
            destination: { type: 'string', description: 'Destination name or slug' },
            interests: { type: 'array', items: { type: 'string' }, description: 'Interests e.g. [temples, food]' },
          },
          required: ['destination'],
        },
      },
      {
        name: 'getUserPreferences',
        description: 'Fetch the authenticated user travel profile and dietary/walking preferences',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'User ID' },
          },
          required: ['userId'],
        },
      },
      {
        name: 'saveTrip',
        description: 'Save a finalized trip itinerary directly into the user account',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'User ID' },
            destination: { type: 'string', description: 'Trip destination' },
            startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
            endDate: { type: 'string', description: 'End date YYYY-MM-DD' },
            numberOfDays: { type: 'number', description: 'Days count' },
            budget: { type: 'number', description: 'Total budget' },
            travelers: { type: 'number', description: 'Number of travelers' },
            itinerary: { type: 'array', description: 'Day-by-day itinerary plan' },
          },
          required: ['userId', 'destination', 'startDate', 'endDate', 'numberOfDays', 'budget', 'itinerary'],
        },
      },
    ];
  }

  async executeTool(name: string, args: any, context?: { userId?: string }): Promise<any> {
    this.logger.log(`Executing tool "${name}" with arguments: ${JSON.stringify(args)}`);

    switch (name) {
      case 'searchDestination': {
        const result = await this.destinationsService.findAll({
          query: args.query,
          category: args.category,
          maxBudget: args.maxBudget,
          limit: 5,
        });
        return result.items.map((d) => ({
          name: d.name,
          slug: d.slug,
          country: d.country,
          category: d.category,
          averageDailyCost: d.averageDailyCost,
          tags: d.tags,
          rating: d.rating,
        }));
      }

      case 'getDestinationDetails': {
        const dest = await this.destinationsService.findBySlugOrId(args.destination);
        return {
          name: dest.name,
          country: dest.country,
          region: dest.region,
          description: dest.description,
          category: dest.category,
          averageDailyCost: dest.averageDailyCost,
          popularSeason: dest.popularSeason,
          topAttractions: dest.topAttractions,
          coordinates: dest.coordinates,
          rating: dest.rating,
        };
      }

      case 'getWeather': {
        return await this.weatherService.getWeather(args.location);
      }

      case 'calculateBudget': {
        const days = Number(args.numberOfDays) || 5;
        const travelers = Number(args.travelers) || 1;
        const tier = args.budgetTier || 'moderate';

        let baseDailyCost = 150;
        try {
          const dest = await this.destinationsService.findBySlugOrId(args.destination);
          baseDailyCost = dest.averageDailyCost || 150;
        } catch (e) {
          // fallback base
        }

        const multiplier = tier === 'budget' ? 0.7 : tier === 'luxury' ? 2.2 : 1.0;
        const perPersonDaily = Math.round(baseDailyCost * multiplier);
        const accommodationDaily = Math.round(perPersonDaily * 0.45 * (travelers > 1 ? 1.4 : 1));
        const foodDaily = Math.round(perPersonDaily * 0.3 * travelers);
        const activitiesDaily = Math.round(perPersonDaily * 0.15 * travelers);
        const transportDaily = Math.round(perPersonDaily * 0.1 * travelers);

        const totalEstimatedUsd = (accommodationDaily + foodDaily + activitiesDaily + transportDaily) * days;

        return {
          destination: args.destination,
          numberOfDays: days,
          travelers,
          budgetTier: tier,
          breakdown: {
            accommodationTotalUsd: accommodationDaily * days,
            foodTotalUsd: foodDaily * days,
            activitiesTotalUsd: activitiesDaily * days,
            localTransportTotalUsd: transportDaily * days,
          },
          totalEstimatedUsd,
          isWithinUserBudget: (args.userBudget ? totalEstimatedUsd <= args.userBudget : true),
        };
      }

      case 'searchHotels': {
        const destName = args.destination || 'Destination';
        const style = args.style || 'boutique_hotel';
        return [
          {
            name: `${destName} Heritage Sanctuary & Spa`,
            type: style,
            stars: 4.8,
            pricePerNightUsd: 140,
            location: `Central ${destName}`,
            amenities: ['Free WiFi', 'Breakfast Included', 'Spa', 'Eco-Friendly'],
          },
          {
            name: `${destName} Grand Vista Hotel`,
            type: 'luxury_hotel',
            stars: 4.9,
            pricePerNightUsd: 260,
            location: `Old Town ${destName}`,
            amenities: ['Rooftop Bar', 'Pool', 'Concierge', 'Fine Dining'],
          },
          {
            name: `${destName} Urban Loft & Suites`,
            type: 'apartment',
            stars: 4.7,
            pricePerNightUsd: 95,
            location: `Arts District`,
            amenities: ['Kitchenette', 'High-speed Internet', 'Balcony'],
          },
        ];
      }

      case 'searchActivities': {
        try {
          const dest = await this.destinationsService.findBySlugOrId(args.destination);
          return dest.topAttractions || [];
        } catch (e) {
          return [
            { name: `Historical Walking Tour of ${args.destination}`, estimatedTimeHours: 3, costUsd: 20 },
            { name: `Local Street Food & Culinary Experience`, estimatedTimeHours: 2.5, costUsd: 35 },
            { name: `Scenic Viewpoint & Sunset Panoramic Spot`, estimatedTimeHours: 2, costUsd: 0 },
          ];
        }
      }

      case 'getUserPreferences': {
        const userId = args.userId || context?.userId;
        if (!userId) {
          return { default: true, message: 'Anonymous session' };
        }
        const user = await this.usersService.findById(userId);
        return {
          name: user.name,
          preferences: user.preferences,
        };
      }

      case 'saveTrip': {
        const userId = args.userId || context?.userId;
        if (!userId) {
          throw new Error('User context required to save trip');
        }
        const mockAuthUser = {
          userId,
          email: 'user@system',
          role: UserRole.USER,
        };
        const saved = await this.tripsService.create(mockAuthUser, {
          destination: args.destination,
          startDate: args.startDate,
          endDate: args.endDate,
          numberOfDays: args.numberOfDays,
          budget: args.budget,
          travelers: args.travelers || 1,
          itinerary: args.itinerary,
          status: 'planning',
          aiGenerated: true,
        });
        return { success: true, tripId: (saved._id as any).toString() };
      }

      default:
        throw new Error(`Tool "${name}" is not implemented.`);
    }
  }
}
