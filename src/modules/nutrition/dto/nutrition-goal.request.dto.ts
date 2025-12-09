import { IsEnum, IsOptional, IsNumber, IsString, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NutritionGoalType } from '../../shared/enums';

export class CreateNutritionGoalDto {
  @ApiPropertyOptional({ enum: NutritionGoalType })
  @IsOptional()
  @IsEnum(NutritionGoalType)
  goalType?: NutritionGoalType;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(10000)
  dailyCalories?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyProtein?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyCarbs?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyFat?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyFiber?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyWaterMl?: number;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  weightUnit?: string;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height?: number;

  @ApiPropertyOptional({ example: 'cm' })
  @IsOptional()
  @IsString()
  heightUnit?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'moderate', description: 'sedentary, light, moderate, active, very_active' })
  @IsOptional()
  @IsString()
  activityLevel?: string;

  @ApiPropertyOptional({ example: ['vegetarian', 'gluten-free'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiPropertyOptional({ example: ['peanuts', 'shellfish'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}

export class UpdateNutritionGoalDto extends CreateNutritionGoalDto {}
