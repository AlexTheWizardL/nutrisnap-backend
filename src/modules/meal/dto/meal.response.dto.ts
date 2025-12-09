import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from '../../shared/enums';
import { Meal } from '../entities/meal.entity';

export class FoodItemResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  fat: number;

  @ApiProperty()
  portion: string;
}

export class MealResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MealType })
  mealType: MealType;

  @ApiProperty()
  foodName: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  fat: number;

  @ApiProperty()
  fiber: number;

  @ApiProperty()
  sugar: number;

  @ApiProperty()
  sodium: number;

  @ApiProperty()
  servingSize: number;

  @ApiProperty()
  servingUnit: string;

  @ApiPropertyOptional()
  aiConfidence?: number;

  @ApiPropertyOptional({ type: [FoodItemResponseDto] })
  foodItems?: FoodItemResponseDto[];

  @ApiProperty()
  loggedAt: Date;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(meal: Meal): MealResponseDto {
    return {
      id: meal.id,
      mealType: meal.mealType,
      foodName: meal.foodName,
      description: meal.description,
      imageUrl: meal.imageUrl,
      calories: Number(meal.calories),
      protein: Number(meal.protein),
      carbs: Number(meal.carbs),
      fat: Number(meal.fat),
      fiber: Number(meal.fiber),
      sugar: Number(meal.sugar),
      sodium: Number(meal.sodium),
      servingSize: Number(meal.servingSize),
      servingUnit: meal.servingUnit,
      aiConfidence: meal.aiConfidence ? Number(meal.aiConfidence) : undefined,
      foodItems: meal.foodItems,
      loggedAt: meal.loggedAt,
      createdAt: meal.createdAt,
    };
  }
}

export class DailyNutritionSummaryDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  totalCalories: number;

  @ApiProperty()
  totalProtein: number;

  @ApiProperty()
  totalCarbs: number;

  @ApiProperty()
  totalFat: number;

  @ApiProperty()
  totalFiber: number;

  @ApiProperty()
  mealCount: number;

  @ApiProperty({ type: [MealResponseDto] })
  meals: MealResponseDto[];
}
