import { Injectable, Logger, OnApplicationBootstrap, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Destination, DestinationDocument } from './schemas/destination.schema';
import { QueryDestinationDto } from './dto/query-destination.dto';
import { RedisService } from '../redis/redis.service';
import { INITIAL_DESTINATIONS } from './destinations.data';

@Injectable()
export class DestinationsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DestinationsService.name);
  private readonly CACHE_TTL_SECONDS = 3600; // 1 hour

  constructor(
    @InjectModel(Destination.name)
    private readonly destinationModel: Model<DestinationDocument>,
    private readonly redisService: RedisService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedInitialDestinations();
  }

  async seedInitialDestinations(): Promise<void> {
    const count = await this.destinationModel.countDocuments();
    if (count === 0) {
      this.logger.log('Seeding initial curated travel destinations...');
      await this.destinationModel.insertMany(INITIAL_DESTINATIONS);
      this.logger.log(`Seeded ${INITIAL_DESTINATIONS.length} destinations.`);
    }
  }

  async findAll(queryDto: QueryDestinationDto) {
    const { query, category, country, maxBudget, page = 1, limit = 12 } = queryDto;
    const cacheKey = `destinations:list:${JSON.stringify(queryDto)}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // continue to db
      }
    }

    const filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ];
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    if (country) {
      filter.country = { $regex: country, $options: 'i' };
    }
    if (maxBudget) {
      filter.averageDailyCost = { $lte: Number(maxBudget) };
    }

    const skip = (page - 1) * limit;
    const [destinations, total] = await Promise.all([
      this.destinationModel.find(filter).sort({ rating: -1 }).skip(skip).limit(limit).exec(),
      this.destinationModel.countDocuments(filter).exec(),
    ]);

    const result = {
      items: destinations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL_SECONDS);
    return result;
  }

  async findBySlugOrId(identifier: string): Promise<DestinationDocument> {
    const cacheKey = `destinations:item:${identifier.toLowerCase()}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // continue to db
      }
    }

    let destination: DestinationDocument | null = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      destination = await this.destinationModel.findById(identifier).exec();
    }
    if (!destination) {
      destination = await this.destinationModel
        .findOne({ slug: identifier.toLowerCase() })
        .exec();
    }
    if (!destination) {
      destination = await this.destinationModel
        .findOne({ name: { $regex: new RegExp(`^${identifier}$`, 'i') } })
        .exec();
    }

    if (!destination) {
      throw new NotFoundException(`Destination "${identifier}" not found`);
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(destination),
      this.CACHE_TTL_SECONDS,
    );
    return destination;
  }

  async searchDestinations(term: string): Promise<DestinationDocument[]> {
    return this.destinationModel
      .find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { country: { $regex: term, $options: 'i' } },
          { tags: { $in: [new RegExp(term, 'i')] } },
        ],
      })
      .limit(10)
      .exec();
  }

  async getFeatured(): Promise<DestinationDocument[]> {
    const cacheKey = 'destinations:featured';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    const featured = await this.destinationModel.find({ isFeatured: true }).limit(6).exec();
    await this.redisService.set(cacheKey, JSON.stringify(featured), this.CACHE_TTL_SECONDS);
    return featured;
  }
}
