import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { CreateMealRequestDto, MealResponseDto, DailyNutritionSummaryDto } from './dto';

@Injectable()
export class MealService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
  ) {}

  async create(userId: string, dto: CreateMealRequestDto): Promise<MealResponseDto> {
    const meal = this.mealRepository.create({
      userId,
      mealType: dto.mealType,
      foodName: dto.foodName,
      description: dto.description,
      imageUrl: dto.imageUrl,
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      fiber: dto.fiber ?? 0,
      sugar: dto.sugar ?? 0,
      sodium: dto.sodium ?? 0,
      servingSize: dto.servingSize ?? 1,
      servingUnit: dto.servingUnit ?? 'serving',
      aiConfidence: dto.aiConfidence,
      aiRawResponse: dto.aiRawResponse,
      foodItems: dto.foodItems,
      loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
    });

    const saved = await this.mealRepository.save(meal);
    return MealResponseDto.fromEntity(saved);
  }

  async findAll(userId: string, limit = 50, offset = 0): Promise<MealResponseDto[]> {
    const meals = await this.mealRepository.find({
      where: { userId },
      order: { loggedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return meals.map(MealResponseDto.fromEntity);
  }

  async findOne(userId: string, id: string): Promise<MealResponseDto> {
    const meal = await this.mealRepository.findOne({
      where: { id, userId },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return MealResponseDto.fromEntity(meal);
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.mealRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Meal not found');
    }
  }

  async getDailySummary(userId: string, date: string): Promise<DailyNutritionSummaryDto> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.mealRepository.find({
      where: {
        userId,
        loggedAt: Between(startOfDay, endOfDay),
      },
      order: { loggedAt: 'ASC' },
    });

    const summary: DailyNutritionSummaryDto = {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      mealCount: meals.length,
      meals: meals.map(MealResponseDto.fromEntity),
    };

    for (const meal of meals) {
      summary.totalCalories += Number(meal.calories);
      summary.totalProtein += Number(meal.protein);
      summary.totalCarbs += Number(meal.carbs);
      summary.totalFat += Number(meal.fat);
      summary.totalFiber += Number(meal.fiber);
    }

    // Round to 1 decimal place
    summary.totalCalories = Math.round(summary.totalCalories);
    summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
    summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
    summary.totalFat = Math.round(summary.totalFat * 10) / 10;
    summary.totalFiber = Math.round(summary.totalFiber * 10) / 10;

    return summary;
  }

  async getWeeklySummary(userId: string, startDate: string): Promise<DailyNutritionSummaryDto[]> {
    const summaries: DailyNutritionSummaryDto[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const summary = await this.getDailySummary(userId, dateStr);
      summaries.push(summary);
    }

    return summaries;
  }

  async getStats(userId: string, days = 30): Promise<{
    averageCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFat: number;
    totalMeals: number;
    streak: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const meals = await this.mealRepository.find({
      where: {
        userId,
        loggedAt: Between(startDate, endDate),
      },
      order: { loggedAt: 'DESC' },
    });

    if (meals.length === 0) {
      return {
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFat: 0,
        totalMeals: 0,
        streak: 0,
      };
    }

    // Calculate daily totals
    const dailyTotals = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

    for (const meal of meals) {
      const dateKey = meal.loggedAt.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateKey) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      dailyTotals.set(dateKey, {
        calories: existing.calories + Number(meal.calories),
        protein: existing.protein + Number(meal.protein),
        carbs: existing.carbs + Number(meal.carbs),
        fat: existing.fat + Number(meal.fat),
      });
    }

    const daysLogged = dailyTotals.size;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    dailyTotals.forEach((totals) => {
      totalCalories += totals.calories;
      totalProtein += totals.protein;
      totalCarbs += totals.carbs;
      totalFat += totals.fat;
    });

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];

      if (dailyTotals.has(dateKey)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      averageCalories: Math.round(totalCalories / daysLogged),
      averageProtein: Math.round(totalProtein / daysLogged),
      averageCarbs: Math.round(totalCarbs / daysLogged),
      averageFat: Math.round(totalFat / daysLogged),
      totalMeals: meals.length,
      streak,
    };
  }
}
