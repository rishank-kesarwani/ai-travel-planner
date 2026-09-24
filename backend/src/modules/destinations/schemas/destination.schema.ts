import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DestinationDocument = Destination & Document;

@Schema({ _id: false })
export class Attraction {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 2 })
  estimatedTimeHours: number;

  @Prop({ default: 0 })
  costUsd: number;

  @Prop({ default: 'sightseeing' })
  category: string;
}

export const AttractionSchema = SchemaFactory.createForClass(Attraction);

@Schema({ _id: false })
export class Coordinates {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;
}

export const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

@Schema({ timestamps: true, collection: 'destinations' })
export class Destination {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ required: true, index: true })
  country: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ required: true, default: 100 })
  averageDailyCost: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'Spring / Autumn' })
  popularSeason: string;

  @Prop({ type: [AttractionSchema], default: [] })
  topAttractions: Attraction[];

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: CoordinatesSchema, required: true })
  coordinates: Coordinates;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: 4.8 })
  rating: number;

  @Prop({ default: 120 })
  reviewCount: number;

  @Prop({ default: true })
  isFeatured: boolean;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);

// Indexes
DestinationSchema.index({ name: 'text', description: 'text', country: 'text', tags: 'text' });
DestinationSchema.index({ category: 1, averageDailyCost: 1 });
