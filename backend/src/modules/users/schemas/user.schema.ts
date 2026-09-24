import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class UserPreferences {
  @Prop({ default: 'moderate' })
  budgetRange: string;

  @Prop({ default: 'cultural' })
  travelStyle: string;

  @Prop({ type: [String], default: [] })
  foodPreferences: string[];

  @Prop({ type: [String], default: [] })
  preferredActivities: string[];

  @Prop({ type: [String], default: [] })
  preferredDestinations: string[];

  @Prop({ default: 'moderate' })
  walkingTolerance: string;

  @Prop({ default: 'boutique_hotel' })
  accommodationPreference: string;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: UserPreferencesSchema, default: () => ({}) })
  preferences: UserPreferences;

  @Prop({ type: String, default: null })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
