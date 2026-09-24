import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto, QueryTripDto, UpdateTripDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  async createTrip(
    @CurrentUser() user: AuthUser,
    @Body() createTripDto: CreateTripDto,
  ) {
    return this.tripsService.create(user, createTripDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user trips with pagination and filtering' })
  async listTrips(
    @CurrentUser() user: AuthUser,
    @Query() queryDto: QueryTripDto,
  ) {
    return this.tripsService.findAll(user, queryDto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get user trip counts & status metrics' })
  async getMetrics(@CurrentUser() user: AuthUser) {
    return this.tripsService.getMetrics(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single trip by ID' })
  async getTripById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.tripsService.findById(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing trip' })
  async updateTrip(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(user, id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a trip' })
  async deleteTrip(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.tripsService.delete(user, id);
  }
}
