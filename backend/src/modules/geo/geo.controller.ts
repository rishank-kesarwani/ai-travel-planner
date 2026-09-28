import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GeoService, GeoDetectionResult } from './geo.service';

@ApiTags('Geo & Currency Intelligence')
@Controller('api/v1/geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Public()
  @Get('detect')
  @ApiOperation({
    summary: 'Detect client geo-location, currency, and supported exchange rates via Edge headers & timezone',
  })
  detectGeo(
    @Headers() headers: Record<string, any>,
    @Query('timezone') timezone?: string,
    @Query('destination') destination?: string,
    @Query('country') country?: string,
  ): GeoDetectionResult {
    return this.geoService.detectGeo(headers, { timezone, destination, country });
  }
}
