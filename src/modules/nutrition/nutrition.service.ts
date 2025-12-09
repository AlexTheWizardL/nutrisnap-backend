import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { MealService } from '../meal/meal.service';
import {
  CreateNutritionGoalDto,
  UpdateNutritionGoalDto,
  NutritionGoalResponseDto,
  DailyProgressResponseDto,
} from './dto';
import { NutritionGoalType } from '../shared/enums';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionGoal)
    private readonly goalRepository: Repository<NutritionGoal>,
    private readonly mealService: MealService,
  ) {}

  async getGoal(userId: string): Promise<NutritionGoalResponseDto | null> {
    const goal = await this.goalRepository.findOne({ where: { userId } });
    return goal ? NutritionGoalResponseDto.fromEntity(goal) : null;
  }

  async createOrUpdateGoal(userId: string, dto: CreateNutritionGoalDto): Promise<NutritionGoalResponseDto> {
    let goal = await this.goalRepository.findOne({ where: { userId } });

    // Calculate recommended calories if user stats are provided
    let calculatedCalories = dto.dailyCalories;
    if (!calculatedCalories && dto.weight && dto.height && dto.age && dto.gender) {
      calculatedCalories = this.calculateRecommendedCalories(
        dto.weight,
        dto.height,
        dto.age,
        dto.gender,
        dto.activityLevel || 'moderate',
        dto.goalType || NutritionGoalType.MAINTAIN,
      );
    }

    if (goal) {
      // Update existing
      Object.assign(goal, {
        ...dto,
        dailyCalories: calculatedCalories || goal.dailyCalories,
      });
    } else {
      // Create new
      goal = this.goalRepository.create({
        userId,
        ...dto,
        dailyCalories: calculatedCalories || 2000,
      });
    }

    // Auto-calculate macros based on calories if not provided
    if (calculatedCalories && !dto.dailyProtein) {
      const macros = this.calculateMacros(calculatedCalories, dto.goalType || NutritionGoalType.MAINTAIN);
      goal.dailyProtein = macros.protein;
      goal.dailyCarbs = macros.carbs;
      goal.dailyFat = macros.fat;
    }

    const saved = await this.goalRepository.save(goal);
    return NutritionGoalResponseDto.fromEntity(saved);
  }

  async updateGoal(userId: string, dto: UpdateNutritionGoalDto): Promise<NutritionGoalResponseDto> {
    const goal = await this.goalRepository.findOne({ where: { userId } });
    if (!goal) {
      throw new NotFoundException('Nutrition goal not found. Create one first.');
    }

    Object.assign(goal, dto);
    const saved = await this.goalRepository.save(goal);
    return NutritionGoalResponseDto.fromEntity(saved);
  }

  async getDailyProgress(userId: string, date?: string): Promise<DailyProgressResponseDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get user's goals
    let goal = await this.goalRepository.findOne({ where: { userId } });
    if (!goal) {
      // Create default goal
      goal = await this.goalRepository.save(
        this.goalRepository.create({
          userId,
          goalType: NutritionGoalType.MAINTAIN,
        }),
      );
    }

    // Get daily consumption
    const dailySummary = await this.mealService.getDailySummary(userId, targetDate);

    const goals = {
      calories: goal.dailyCalories,
      protein: goal.dailyProtein,
      carbs: goal.dailyCarbs,
      fat: goal.dailyFat,
      fiber: goal.dailyFiber,
    };

    const consumed = {
      calories: dailySummary.totalCalories,
      protein: dailySummary.totalProtein,
      carbs: dailySummary.totalCarbs,
      fat: dailySummary.totalFat,
      fiber: dailySummary.totalFiber,
    };

    const remaining = {
      calories: Math.max(0, goals.calories - consumed.calories),
      protein: Math.max(0, goals.protein - consumed.protein),
      carbs: Math.max(0, goals.carbs - consumed.carbs),
      fat: Math.max(0, goals.fat - consumed.fat),
      fiber: Math.max(0, goals.fiber - consumed.fiber),
    };

    const progress = {
      calories: Math.round((consumed.calories / goals.calories) * 100),
      protein: Math.round((consumed.protein / goals.protein) * 100),
      carbs: Math.round((consumed.carbs / goals.carbs) * 100),
      fat: Math.round((consumed.fat / goals.fat) * 100),
      fiber: Math.round((consumed.fiber / goals.fiber) * 100),
    };

    return {
      date: targetDate,
      goals,
      consumed,
      remaining,
      progress,
    };
  }

  private calculateRecommendedCalories(
    weight: number,
    height: number,
    age: number,
    gender: string,
    activityLevel: string,
    goalType: NutritionGoalType,
  ): number {
    // Mifflin-St Jeor Equation for BMR
    let bmr: number;
    if (gender.toLowerCase() === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Goal adjustments
    const goalAdjustments: Record<NutritionGoalType, number> = {
      [NutritionGoalType.LOSE_WEIGHT]: -500,
      [NutritionGoalType.MAINTAIN]: 0,
      [NutritionGoalType.GAIN_WEIGHT]: 300,
      [NutritionGoalType.BUILD_MUSCLE]: 400,
    };

    return Math.round(tdee + (goalAdjustments[goalType] || 0));
  }

  private calculateMacros(
    calories: number,
    goalType: NutritionGoalType,
  ): { protein: number; carbs: number; fat: number } {
    // Macro ratios based on goal
    let proteinRatio: number;
    let carbRatio: number;
    let fatRatio: number;

    switch (goalType) {
      case NutritionGoalType.LOSE_WEIGHT:
        proteinRatio = 0.35;
        carbRatio = 0.35;
        fatRatio = 0.30;
        break;
      case NutritionGoalType.BUILD_MUSCLE:
        proteinRatio = 0.35;
        carbRatio = 0.45;
        fatRatio = 0.20;
        break;
      case NutritionGoalType.GAIN_WEIGHT:
        proteinRatio = 0.25;
        carbRatio = 0.50;
        fatRatio = 0.25;
        break;
      default: // MAINTAIN
        proteinRatio = 0.25;
        carbRatio = 0.50;
        fatRatio = 0.25;
    }

    return {
      protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbRatio) / 4),
      fat: Math.round((calories * fatRatio) / 9), // 9 cal per gram
    };
  }
}
