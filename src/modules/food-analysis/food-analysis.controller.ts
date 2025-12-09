import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FoodAnalysisService } from './food-analysis.service';
import { AnalyzeFoodRequestDto, AnalyzeFoodResponseDto } from './dto';

@ApiTags('Food Analysis')
@ApiBearerAuth()
@Controller('food-analysis')
export class FoodAnalysisController {
  constructor(private readonly foodAnalysisService: FoodAnalysisService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze a food image using AI' })
  @ApiResponse({ status: 200, type: AnalyzeFoodResponseDto })
  async analyzeFood(@Body() dto: AnalyzeFoodRequestDto): Promise<AnalyzeFoodResponseDto> {
    return this.foodAnalysisService.analyzeFood(dto);
  }
}
