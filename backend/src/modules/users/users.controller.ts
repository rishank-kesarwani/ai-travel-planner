import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdatePreferencesDto, UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile & preferences' })
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateDto);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user travel preferences' })
  async updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body() prefs: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(user.userId, prefs);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  async listAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
