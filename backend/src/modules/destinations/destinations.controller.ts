import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';
import { QueryDestinationDto } from './dto/query-destination.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Destinations')
@Controller('api/v1/destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and filter travel destinations with caching' })
  async listDestinations(@Query() queryDto: QueryDestinationDto) {
    return this.destinationsService.findAll(queryDto);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get curated featured destinations' })
  async getFeatured() {
    return this.destinationsService.getFeatured();
  }

  @Public()
  @Get(':identifier')
  @ApiOperation({ summary: 'Get destination details by slug or ID' })
  async getDetails(@Param('identifier') identifier: string) {
    return this.destinationsService.findBySlugOrId(identifier);
  }
}
