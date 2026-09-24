import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Weather')
@Controller('api/v1/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get current weather and 5-day forecast for a destination' })
  @ApiQuery({ name: 'location', required: true, example: 'Kyoto, Japan' })
  async getWeather(@Query('location') location: string) {
    return this.weatherService.getWeather(location || 'Kyoto');
  }
}
