import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { Public } from '../../common/decorators/public.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsOptional()
  @IsString()
  visitedDate?: string;
}

@ApiTags('Reviews')
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('destination/:destinationId')
  @ApiOperation({ summary: 'Get all reviews for a destination' })
  async getDestinationReviews(@Param('destinationId') destinationId: string) {
    return this.reviewsService.getByDestination(destinationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('destination/:destinationId')
  @ApiOperation({ summary: 'Post a review for a destination' })
  async createReview(
    @CurrentUser() user: AuthUser,
    @Param('destinationId') destinationId: string,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(
      user,
      destinationId,
      body.rating,
      body.comment,
      body.visitedDate,
    );
  }
}
