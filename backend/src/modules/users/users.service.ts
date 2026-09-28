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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bcrypt = await import('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ConflictException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash,
      refreshTokenHash: null,
    });

    return { success: true, message: 'Password successfully changed' };
  }

  async setResetPasswordToken(email: string, tokenHash: string, expires: Date): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: expires,
      },
      { new: true },
    );
  }

  async findByResetPasswordToken(tokenHash: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async resetPassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash,
      refreshTokenHash: null,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash -refreshTokenHash');
  }
}


