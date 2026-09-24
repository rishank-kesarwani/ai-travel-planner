import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';
import { CreateTripDto, QueryTripDto, UpdateTripDto } from './dto/trip.dto';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UserRole } from '../../common/enums/roles.enum';
import { QueueProducerService } from '../queues/queue-producer.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
    private readonly queueProducer: QueueProducerService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(user: AuthUser, createDto: CreateTripDto): Promise<TripDocument> {
    const totalCost = this.calculateTotalCost(createDto.itinerary);

    const trip = new this.tripModel({
      ...createDto,
      userId: new Types.ObjectId(user.userId),
      totalEstimatedCostUsd: totalCost,
    });

    const savedTrip = await trip.save();
    this.logger.log(`Trip created: ${savedTrip._id} by user ${user.userId}`);

    // Trigger asynchronous BullMQ job for RAG indexing into AI Platform
    try {
      await this.queueProducer.addTripIndexingJob({
        tripId: (savedTrip._id as any).toString(),
        userId: user.userId,
        destination: savedTrip.destination,
        itinerary: savedTrip.itinerary,
        interests: savedTrip.interests,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.warn(`Failed to dispatch trip-indexing job: ${err.message}`);
    }

    // Trigger Dual-Channel Notification (Email + Push) via Notification Service
    this.notificationService
      .sendTripCreatedNotification(
        { id: user.userId, email: user.email, name: user.name || 'Traveler' },
        {
          _id: (savedTrip._id as any).toString(),
          destination: savedTrip.destination,
          startDate: savedTrip.startDate,
          endDate: savedTrip.endDate,
          numberOfDays: savedTrip.numberOfDays,
          budget: savedTrip.budget,
          itinerary: savedTrip.itinerary,
        },
      )
      .catch(() => {});

    return savedTrip;
  }

  async findAll(user: AuthUser, queryDto: QueryTripDto) {
    const { status, destination, page = 1, limit = 10 } = queryDto;
    const filter: any = {};

    if (user.role !== UserRole.ADMIN) {
      filter.userId = new Types.ObjectId(user.userId);
    }
    if (status) {
      filter.status = status;
    }
    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [trips, total] = await Promise.all([
      this.tripModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.tripModel.countDocuments(filter).exec(),
    ]);

    return {
      items: trips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(user: AuthUser, id: string): Promise<TripDocument> {
    const trip = await this.tripModel.findById(id).exec();
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (user.role !== UserRole.ADMIN && trip.userId.toString() !== user.userId) {
      throw new ForbiddenException('You do not have permission to view this trip');
    }

    return trip;
  }

  async update(user: AuthUser, id: string, updateDto: UpdateTripDto): Promise<TripDocument> {
    const trip = await this.findById(user, id);

    if (updateDto.itinerary) {
      (updateDto as any).totalEstimatedCostUsd = this.calculateTotalCost(updateDto.itinerary);
    }

    const updated = await this.tripModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Trip not found');
    }

    // Trigger asynchronous re-indexing
    try {
      await this.queueProducer.addTripIndexingJob({
        tripId: (updated._id as any).toString(),
        userId: user.userId,
        destination: updated.destination,
        itinerary: updated.itinerary,
        interests: updated.interests,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.warn(`Failed to dispatch re-indexing job: ${err.message}`);
    }

    if (updateDto.status && updateDto.status !== trip.status) {
      this.notificationService
        .sendTripStatusUpdatedNotification(
          { id: user.userId, email: user.email, name: user.name || 'Traveler' },
          { _id: (updated._id as any).toString(), destination: updated.destination },
          updateDto.status,
        )
        .catch(() => {});
    }

    return updated;
  }

  async delete(user: AuthUser, id: string): Promise<{ success: boolean; message: string }> {
    await this.findById(user, id);
    await this.tripModel.findByIdAndDelete(id).exec();
    return { success: true, message: 'Trip deleted successfully' };
  }

  async getMetrics(user: AuthUser) {
    const userIdObj = new Types.ObjectId(user.userId);
    const [totalTrips, planning, completed, confirmed] = await Promise.all([
      this.tripModel.countDocuments({ userId: userIdObj }),
      this.tripModel.countDocuments({ userId: userIdObj, status: 'planning' }),
      this.tripModel.countDocuments({ userId: userIdObj, status: 'completed' }),
      this.tripModel.countDocuments({ userId: userIdObj, status: 'confirmed' }),
    ]);

    return {
      totalTrips,
      planning,
      completed,
      confirmed,
    };
  }

  private calculateTotalCost(itinerary?: any[]): number {
    if (!itinerary || !Array.isArray(itinerary)) return 0;
    return itinerary.reduce((acc, day) => {
      if (day.estimatedDailyCostUsd) {
        return acc + day.estimatedDailyCostUsd;
      }
      const actCost = (day.activities || []).reduce(
        (sum: number, act: any) => sum + (act.estimatedCostUsd || 0),
        0,
      );
      return acc + actCost;
    }, 0);
  }
}
