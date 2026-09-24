import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Destination.name) private readonly destinationModel: Model<DestinationDocument>,
  ) {}

  async createReview(
    user: AuthUser,
    destinationId: string,
    rating: number,
    comment: string,
    visitedDate?: string,
  ) {
    const review = new this.reviewModel({
      userId: new Types.ObjectId(user.userId),
      destinationId: new Types.ObjectId(destinationId),
      rating,
      comment,
      userName: user.name || 'Traveler',
      visitedDate: visitedDate || new Date().toISOString().split('T')[0],
    });

    const saved = await review.save();

    // Update destination avg rating and review count
    const reviews = await this.reviewModel.find({ destinationId: new Types.ObjectId(destinationId) });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.destinationModel.findByIdAndUpdate(destinationId, {
      rating: parseFloat(avgRating.toFixed(2)),
      reviewCount: reviews.length,
    });

    return saved;
  }

  async getByDestination(destinationId: string) {
    return this.reviewModel
      .find({ destinationId: new Types.ObjectId(destinationId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }
}
