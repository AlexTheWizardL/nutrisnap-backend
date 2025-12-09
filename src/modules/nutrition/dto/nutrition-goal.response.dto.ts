import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NutritionGoalType } from '../../shared/enums';
import { NutritionGoal } from '../entities/nutrition-goal.entity';

export class NutritionGoalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NutritionGoalType })
  goalType: NutritionGoalType;

  @ApiProperty()
  dailyCalories: number;

  @ApiProperty()
  dailyProtein: number;

  @ApiProperty()
  dailyCarbs: number;

  @ApiProperty()
  dailyFat: number;

  @ApiProperty()
  dailyFiber: number;

  @ApiProperty()
  dailyWaterMl: number;

  @ApiPropertyOptional()
  weight?: number;

  @ApiPropertyOptional()
  weightUnit?: string;

  @ApiPropertyOptional()
  height?: number;

  @ApiPropertyOptional()
  heightUnit?: string;

  @ApiPropertyOptional()
  age?: number;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  activityLevel?: string;

  @ApiProperty({ type: [String] })
  dietaryRestrictions: string[];

  @ApiProperty({ type: [String] })
  allergies: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(goal: NutritionGoal): NutritionGoalResponseDto {
    return {
      id: goal.id,
      goalType: goal.goalType,
      dailyCalories: goal.dailyCalories,
      dailyProtein: goal.dailyProtein,
      dailyCarbs: goal.dailyCarbs,
      dailyFat: goal.dailyFat,
      dailyFiber: goal.dailyFiber,
      dailyWaterMl: goal.dailyWaterMl,
      weight: goal.weight ? Number(goal.weight) : undefined,
      weightUnit: goal.weightUnit,
      height: goal.height,
      heightUnit: goal.heightUnit,
      age: goal.age,
      gender: goal.gender,
      activityLevel: goal.activityLevel,
      dietaryRestrictions: goal.dietaryRestrictions,
      allergies: goal.allergies,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}

export class DailyProgressResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };

  @ApiProperty()
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };

  @ApiProperty()
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };

  @ApiProperty()
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
