import { Controller, Get, Post, Put, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import {
  CreateNutritionGoalDto,
  UpdateNutritionGoalDto,
  NutritionGoalResponseDto,
  DailyProgressResponseDto,
} from './dto';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Nutrition')
@ApiBearerAuth()
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('goals')
  @ApiOperation({ summary: 'Get user nutrition goals' })
  @ApiResponse({ status: 200, type: NutritionGoalResponseDto })
  async getGoal(@CurrentUser('id') userId: string): Promise<NutritionGoalResponseDto | null> {
    return this.nutritionService.getGoal(userId);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create or update nutrition goals' })
  @ApiResponse({ status: 201, type: NutritionGoalResponseDto })
  async createOrUpdateGoal(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateNutritionGoalDto,
  ): Promise<NutritionGoalResponseDto> {
    return this.nutritionService.createOrUpdateGoal(userId, dto);
  }

  @Put('goals')
  @ApiOperation({ summary: 'Update nutrition goals' })
  @ApiResponse({ status: 200, type: NutritionGoalResponseDto })
  async updateGoal(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNutritionGoalDto,
  ): Promise<NutritionGoalResponseDto> {
    return this.nutritionService.updateGoal(userId, dto);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get daily nutrition progress' })
  @ApiResponse({ status: 200, type: DailyProgressResponseDto })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
  async getDailyProgress(
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
  ): Promise<DailyProgressResponseDto> {
    return this.nutritionService.getDailyProgress(userId, date);
  }
}
