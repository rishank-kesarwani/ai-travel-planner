import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema({ _id: false })
export class TripActivity {
  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  location?: string;

  @Prop({ default: 2 })
  durationHours?: number;

  @Prop({ default: 0 })
  estimatedCostUsd?: number;

  @Prop({ default: 'sightseeing' })
  category?: string;

  @Prop()
  tips?: string;
}

export const TripActivitySchema = SchemaFactory.createForClass(TripActivity);

@Schema({ _id: false })
export class TripMeals {
  @Prop()
  breakfast?: string;

  @Prop()
  lunch?: string;

  @Prop()
  dinner?: string;
}

export const TripMealsSchema = SchemaFactory.createForClass(TripMeals);

@Schema({ _id: false })
export class DayPlan {
  @Prop({ required: true })
  day: number;

  @Prop()
  date?: string;

  @Prop({ required: true })
  theme: string;

  @Prop({ type: [TripActivitySchema], default: [] })
  activities: TripActivity[];

  @Prop({ type: TripMealsSchema })
  meals?: TripMeals;

  @Prop({ default: 0 })
  estimatedDailyCostUsd?: number;
}

export const DayPlanSchema = SchemaFactory.createForClass(DayPlan);

@Schema({ _id: false })
export class TripCitation {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  source: string;

  @Prop()
  snippet?: string;
}

export const TripCitationSchema = SchemaFactory.createForClass(TripCitation);

@Schema({ timestamps: true, collection: 'trips' })
export class Trip {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  destination: string;

  @Prop({ lowercase: true, trim: true })
  destinationSlug?: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ required: true, min: 1 })
  numberOfDays: number;

  @Prop({ required: true, min: 0 })
  budget: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 1, min: 1 })
  travelers: number;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @Prop({ type: [DayPlanSchema], default: [] })
  itinerary: DayPlan[];

  @Prop({
    type: String,
    enum: ['planning', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'planning',
    index: true,
  })
  status: string;

  @Prop({ default: 0 })
  totalEstimatedCostUsd?: number;

  @Prop({ default: false })
  aiGenerated?: boolean;

  @Prop({ type: [TripCitationSchema], default: [] })
  citations?: TripCitation[];

  @Prop({ default: '' })
  notes?: string;

  @Prop()
  coverImageUrl?: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);

// Indexes
TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ destination: 1, status: 1 });
