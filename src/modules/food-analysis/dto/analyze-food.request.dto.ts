import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from '../../shared/enums';

export class AnalyzeFoodRequestDto {
  @ApiProperty({
    description: 'Base64 encoded image of the food',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
  })
  @IsString()
  imageBase64: string;

  @ApiPropertyOptional({
    description: 'Additional context about the meal',
    example: 'This is my lunch, about 300g of chicken with rice'
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ enum: MealType })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
