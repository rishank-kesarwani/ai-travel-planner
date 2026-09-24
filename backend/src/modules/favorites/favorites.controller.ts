import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':destinationId')
  @ApiOperation({ summary: 'Save destination to favorites' })
  async addFavorite(
    @CurrentUser() user: AuthUser,
    @Param('destinationId') destinationId: string,
  ) {
    return this.favoritesService.addFavorite(user, destinationId);
  }

  @Delete(':destinationId')
  @ApiOperation({ summary: 'Remove destination from favorites' })
  async removeFavorite(
    @CurrentUser() user: AuthUser,
    @Param('destinationId') destinationId: string,
  ) {
    return this.favoritesService.removeFavorite(user, destinationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite destinations for current user' })
  async getUserFavorites(@CurrentUser() user: AuthUser) {
    return this.favoritesService.getUserFavorites(user);
  }

  @Get('check/:destinationId')
  @ApiOperation({ summary: 'Check if destination is favorited' })
  async isFavorite(
    @CurrentUser() user: AuthUser,
    @Param('destinationId') destinationId: string,
  ) {
    const favorited = await this.favoritesService.isFavorite(user, destinationId);
    return { isFavorite: favorited };
  }
}
