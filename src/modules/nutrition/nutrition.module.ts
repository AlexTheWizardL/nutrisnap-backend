import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { MealModule } from '../meal/meal.module';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionGoal]), MealModule],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
