import { Module, forwardRef } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { DestinationsModule } from '../destinations/destinations.module';
import { WeatherModule } from '../weather/weather.module';
import { UsersModule } from '../users/users.module';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [
    DestinationsModule,
    WeatherModule,
    UsersModule,
    forwardRef(() => TripsModule),
  ],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
