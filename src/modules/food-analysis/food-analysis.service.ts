import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyzeFoodRequestDto, AnalyzeFoodResponseDto, DetectedFoodItemDto } from './dto';

type AIProvider = 'claude' | 'openai';

@Injectable()
export class FoodAnalysisService {
  private readonly logger = new Logger(FoodAnalysisService.name);
  private readonly claudeApiKey: string;
  private readonly openaiApiKey: string;
  private readonly preferredProvider: AIProvider;
  private readonly claudeModel: string;
  private readonly openaiModel: string;

  constructor(private readonly configService: ConfigService) {
    this.claudeApiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || '';
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.claudeModel = this.configService.get<string>('CLAUDE_MODEL') || 'claude-sonnet-4-20250514';
    this.openaiModel = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';

    // Determine preferred provider based on available keys
    const configuredProvider = this.configService.get<string>('AI_PROVIDER')?.toLowerCase();
    if (configuredProvider === 'openai' && this.openaiApiKey) {
      this.preferredProvider = 'openai';
    } else if (configuredProvider === 'claude' && this.claudeApiKey) {
      this.preferredProvider = 'claude';
    } else if (this.claudeApiKey) {
      this.preferredProvider = 'claude';
    } else if (this.openaiApiKey) {
      this.preferredProvider = 'openai';
    } else {
      this.preferredProvider = 'claude'; // Default, will fail if no key
    }

    this.logger.log(`AI Provider configured: ${this.preferredProvider}`);
  }

  async analyzeFood(dto: AnalyzeFoodRequestDto): Promise<AnalyzeFoodResponseDto> {
    if (!this.claudeApiKey && !this.openaiApiKey) {
      throw new BadRequestException('No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY');
    }

    try {
      let content: string;

      if (this.preferredProvider === 'claude') {
        content = await this.analyzeWithClaude(dto);
      } else {
        content = await this.analyzeWithOpenAI(dto);
      }

      // Parse the JSON response
      const parsed = this.parseAIResponse(content);

      // Calculate totals
      const totalNutrition = this.calculateTotals(parsed.foodItems);

      return {
        success: true,
        foodName: parsed.foodName,
        description: parsed.description,
        foodItems: parsed.foodItems,
        totalNutrition,
        confidence: parsed.confidence,
        suggestions: parsed.suggestions,
        rawResponse: parsed,
      };
    } catch (error) {
      this.logger.error('Food analysis failed', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to analyze food image');
    }
  }

  private getSystemPrompt(): string {
    return `You are a nutrition expert AI assistant. Analyze the food image and provide detailed nutritional information.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just raw JSON.

Response format:
{
  "foodName": "Main dish name",
  "description": "Brief description of the meal",
  "foodItems": [
    {
      "name": "Individual food item",
      "estimatedPortion": "portion with unit (e.g., '150g', '1 cup')",
      "calories": number,
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams),
      "fiber": number (grams),
      "sugar": number (grams)
    }
  ],
  "confidence": number between 0 and 1,
  "suggestions": ["nutritional tips or observations"]
}

Be accurate with portion estimates. If unsure, provide conservative estimates.
Consider cooking methods (fried adds fat, grilled is leaner).
Include all visible items including sauces, dressings, and sides.`;
  }

  private async analyzeWithClaude(dto: AnalyzeFoodRequestDto): Promise<string> {
    if (!this.claudeApiKey) {
      throw new BadRequestException('Claude API key not configured');
    }

    // Extract base64 data and media type
    let base64Data = dto.imageBase64;
    let mediaType = 'image/jpeg';

    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mediaType = matches[1];
        base64Data = matches[2];
      }
    }

    const userMessage = dto.context
      ? `Analyze this food image. Additional context: ${dto.context}`
      : 'Analyze this food image and provide nutritional information.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.claudeModel,
        max_tokens: 1500,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: userMessage,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Claude API error: ${error}`);
      throw new BadRequestException('Failed to analyze food image with Claude');
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new BadRequestException('No response from Claude');
    }

    return content;
  }

  private async analyzeWithOpenAI(dto: AnalyzeFoodRequestDto): Promise<string> {
    if (!this.openaiApiKey) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const imageUrl = dto.imageBase64.startsWith('data:')
      ? dto.imageBase64
      : `data:image/jpeg;base64,${dto.imageBase64}`;

    const userMessage = dto.context
      ? `Analyze this food image. Additional context: ${dto.context}`
      : 'Analyze this food image and provide nutritional information.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: userMessage,
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`OpenAI API error: ${error}`);
      throw new BadRequestException('Failed to analyze food image with OpenAI');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new BadRequestException('No response from OpenAI');
    }

    return content;
  }

  private parseAIResponse(content: string): {
    foodName: string;
    description: string;
    foodItems: DetectedFoodItemDto[];
    confidence: number;
    suggestions: string[];
  } {
    try {
      // Remove any markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const parsed = JSON.parse(jsonStr);

      return {
        foodName: parsed.foodName || 'Unknown Food',
        description: parsed.description || '',
        foodItems: (parsed.foodItems || []).map((item: Record<string, unknown>) => ({
          name: item.name as string || 'Unknown',
          estimatedPortion: item.estimatedPortion as string || '1 serving',
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          fiber: Number(item.fiber) || 0,
          sugar: Number(item.sugar) || 0,
        })),
        confidence: Number(parsed.confidence) || 0.5,
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response', { content, error });
      throw new BadRequestException('Failed to parse nutrition data');
    }
  }

  private calculateTotals(items: DetectedFoodItemDto[]): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  } {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };

    for (const item of items) {
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.carbs += item.carbs;
      totals.fat += item.fat;
      totals.fiber += item.fiber || 0;
      totals.sugar += item.sugar || 0;
    }

    // Round to 1 decimal
    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;
    totals.fiber = Math.round(totals.fiber * 10) / 10;
    totals.sugar = Math.round(totals.sugar * 10) / 10;

    return totals;
  }
}
