import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetectedFoodItemDto {
  @ApiProperty({ example: 'Grilled Chicken Breast' })
  name: string;

  @ApiProperty({ example: '150g' })
  estimatedPortion: string;

  @ApiProperty({ example: 248 })
  calories: number;

  @ApiProperty({ example: 46.5 })
  protein: number;

  @ApiProperty({ example: 0 })
  carbs: number;

  @ApiProperty({ example: 5.4 })
  fat: number;

  @ApiPropertyOptional({ example: 0 })
  fiber?: number;

  @ApiPropertyOptional({ example: 0 })
  sugar?: number;
}

export class AnalyzeFoodResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Grilled Chicken with Rice and Vegetables' })
  foodName: string;

  @ApiPropertyOptional({ example: 'A balanced meal consisting of grilled chicken breast, white rice, and steamed broccoli.' })
  description?: string;

  @ApiProperty({ type: [DetectedFoodItemDto] })
  foodItems: DetectedFoodItemDto[];

  @ApiProperty({ description: 'Total nutrition for the entire meal' })
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };

  @ApiProperty({ example: 0.85, description: 'Confidence score 0-1' })
  confidence: number;

  @ApiPropertyOptional({ type: [String], example: ['Consider adding more vegetables', 'Good protein source'] })
  suggestions?: string[];

  @ApiPropertyOptional({ description: 'Raw AI response for debugging' })
  rawResponse?: Record<string, unknown>;
}
