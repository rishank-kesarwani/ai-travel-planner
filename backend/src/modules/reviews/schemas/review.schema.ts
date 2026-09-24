import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Destination', required: true, index: true })
  destinationId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  comment: string;

  @Prop()
  userName?: string;

  @Prop()
  visitedDate?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ destinationId: 1, createdAt: -1 });
