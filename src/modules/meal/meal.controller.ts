import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealService } from './meal.service';
import { CreateMealRequestDto, MealResponseDto, DailyNutritionSummaryDto } from './dto';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Meals')
@ApiBearerAuth()
@Controller('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new meal' })
  @ApiResponse({ status: 201, type: MealResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMealRequestDto,
  ): Promise<MealResponseDto> {
    return this.mealService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals for the user' })
  @ApiResponse({ status: 200, type: [MealResponseDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<MealResponseDto[]> {
    return this.mealService.findAll(userId, limit, offset);
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Get daily nutrition summary' })
  @ApiResponse({ status: 200, type: DailyNutritionSummaryDto })
  async getDailySummary(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ): Promise<DailyNutritionSummaryDto> {
    return this.mealService.getDailySummary(userId, date);
  }

  @Get('weekly/:startDate')
  @ApiOperation({ summary: 'Get weekly nutrition summary' })
  @ApiResponse({ status: 200, type: [DailyNutritionSummaryDto] })
  async getWeeklySummary(
    @CurrentUser('id') userId: string,
    @Param('startDate') startDate: string,
  ): Promise<DailyNutritionSummaryDto[]> {
    return this.mealService.getWeeklySummary(userId, startDate);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get nutrition statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this.mealService.getStats(userId, days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific meal' })
  @ApiResponse({ status: 200, type: MealResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MealResponseDto> {
    return this.mealService.findOne(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal' })
  @ApiResponse({ status: 204 })
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.mealService.delete(userId, id);
  }
}
