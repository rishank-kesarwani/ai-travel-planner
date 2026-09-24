import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TripActivityDto {
  @ApiProperty({ example: '09:00 AM' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 'Visit Fushimi Inari Shrine' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Explore the scenic torii gates and mountain trails.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Kyoto, Japan' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  estimatedCostUsd?: number;

  @ApiPropertyOptional({ example: 'cultural' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Arrive early to avoid crowds' })
  @IsOptional()
  @IsString()
  tips?: string;
}

export class DayPlanDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  day: number;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ example: 'Historic Temples & Traditional Shrines' })
  @IsString()
  @IsNotEmpty()
  theme: string;

  @ApiProperty({ type: [TripActivityDto] })
  @IsArray()
  activities: TripActivityDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  estimatedDailyCostUsd?: number;
}

export class CreateTripDto {
  @ApiProperty({ example: 'Kyoto, Japan' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiPropertyOptional({ example: 'kyoto' })
  @IsOptional()
  @IsString()
  destinationSlug?: string;

  @ApiProperty({ example: '2026-10-15' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-10-20' })
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  numberOfDays: number;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  travelers?: number;

  @ApiPropertyOptional({ example: ['culture', 'temples', 'food'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiPropertyOptional({ type: [DayPlanDto] })
  @IsOptional()
  @IsArray()
  itinerary?: DayPlanDto[];

  @ApiPropertyOptional({ example: 'planning' })
  @IsOptional()
  @IsEnum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  citations?: Array<{ title: string; source: string; snippet?: string }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}

export class UpdateTripDto {
  @ApiPropertyOptional({ example: 'Kyoto & Nara, Japan' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-21' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfDays?: number;

  @ApiPropertyOptional({ example: 1800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  travelers?: number;

  @ApiPropertyOptional({ type: [DayPlanDto] })
  @IsOptional()
  @IsArray()
  itinerary?: DayPlanDto[];

  @ApiPropertyOptional({ example: 'confirmed' })
  @IsOptional()
  @IsEnum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryTripDto {
  @ApiPropertyOptional({ enum: ['planning', 'confirmed', 'in_progress', 'completed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
