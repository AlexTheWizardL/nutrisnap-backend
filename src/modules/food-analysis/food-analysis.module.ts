import { Module } from '@nestjs/common';
import { FoodAnalysisService } from './food-analysis.service';
import { FoodAnalysisController } from './food-analysis.controller';

@Module({
  controllers: [FoodAnalysisController],
  providers: [FoodAnalysisService],
  exports: [FoodAnalysisService],
})
export class FoodAnalysisModule {}
