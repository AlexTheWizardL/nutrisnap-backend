import { IsEnum, IsOptional, IsNumber, IsString, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from '../../shared/enums';

export class FoodItemDto {
  @ApiProperty({ example: 'Grilled Chicken Breast' })
  @IsString()
  name: string;

  @ApiProperty({ example: 165 })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({ example: 31 })
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  carbs: number;

  @ApiProperty({ example: 3.6 })
  @IsNumber()
  @Min(0)
  fat: number;

  @ApiProperty({ example: '100g' })
  @IsString()
  portion: string;
}

export class CreateMealRequestDto {
  @ApiProperty({ enum: MealType, example: MealType.LUNCH })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({ example: 'Grilled Chicken Salad' })
  @IsString()
  foodName: string;

  @ApiPropertyOptional({ example: 'Grilled chicken with mixed greens, tomatoes, and olive oil dressing' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/meals/123.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 450 })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  carbs: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  fat: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  servingSize?: number;

  @ApiPropertyOptional({ example: 'cup' })
  @IsOptional()
  @IsString()
  servingUnit?: string;

  @ApiPropertyOptional({ example: 0.85 })
  @IsOptional()
  @IsNumber()
  aiConfidence?: number;

  @ApiPropertyOptional()
  @IsOptional()
  aiRawResponse?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [FoodItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodItemDto)
  foodItems?: FoodItemDto[];

  @ApiPropertyOptional({ example: '2024-01-15T12:30:00Z' })
  @IsOptional()
  @IsDateString()
  loggedAt?: string;
}
