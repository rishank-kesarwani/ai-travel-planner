import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async addFavorite(user: AuthUser, destinationId: string) {
    try {
      const favorite = new this.favoriteModel({
        userId: new Types.ObjectId(user.userId),
        destinationId: new Types.ObjectId(destinationId),
      });
      return await favorite.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException('Destination is already in your favorites');
      }
      throw err;
    }
  }

  async removeFavorite(user: AuthUser, destinationId: string) {
    const deleted = await this.favoriteModel.findOneAndDelete({
      userId: new Types.ObjectId(user.userId),
      destinationId: new Types.ObjectId(destinationId),
    });
    if (!deleted) {
      throw new NotFoundException('Favorite not found');
    }
    return { success: true, message: 'Removed from favorites' };
  }

  async getUserFavorites(user: AuthUser) {
    return this.favoriteModel
      .find({ userId: new Types.ObjectId(user.userId) })
      .populate('destinationId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async isFavorite(user: AuthUser, destinationId: string): Promise<boolean> {
    const count = await this.favoriteModel.countDocuments({
      userId: new Types.ObjectId(user.userId),
      destinationId: new Types.ObjectId(destinationId),
    });
    return count > 0;
  }
}
