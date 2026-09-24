import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 'budget' })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional({ example: 'adventure' })
  @IsOptional()
  @IsString()
  travelStyle?: string;

  @ApiPropertyOptional({ example: ['vegetarian', 'street_food'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodPreferences?: string[];

  @ApiPropertyOptional({ example: ['hiking', 'historical_sites'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredActivities?: string[];

  @ApiPropertyOptional({ example: ['Kyoto', 'Reykjavik'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredDestinations?: string[];

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsString()
  walkingTolerance?: string;

  @ApiPropertyOptional({ example: 'boutique_hotel' })
  @IsOptional()
  @IsString()
  accommodationPreference?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: () => UpdatePreferencesDto })
  @IsOptional()
  preferences?: UpdatePreferencesDto;
}
