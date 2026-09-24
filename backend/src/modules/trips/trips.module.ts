import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trip.schema';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    forwardRef(() => ToolsModule),
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService, MongooseModule],
})
export class TripsModule {}
