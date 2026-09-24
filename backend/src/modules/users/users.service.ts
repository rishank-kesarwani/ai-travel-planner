import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdatePreferencesDto, UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    preferences?: any;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: userData.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const createdUser = new this.userModel({
      ...userData,
      email: userData.email.toLowerCase(),
      role: userData.role || UserRole.USER,
    });
    return createdUser.save();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-passwordHash -refreshTokenHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash });
  }

  async update(userId: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    const updateData: any = {};
    if (updateDto.name) updateData.name = updateDto.name;
    if (updateDto.preferences) {
      for (const [key, val] of Object.entries(updateDto.preferences)) {
        if (val !== undefined) {
          updateData[`preferences.${key}`] = val;
        }
      }
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select('-passwordHash -refreshTokenHash');

    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async updatePreferences(userId: string, prefs: UpdatePreferencesDto): Promise<UserDocument> {
    return this.update(userId, { preferences: prefs });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash -refreshTokenHash');
  }
}
