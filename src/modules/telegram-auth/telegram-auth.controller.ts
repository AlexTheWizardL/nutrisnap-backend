import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramAuthRequestDto, TelegramAuthResponseDto } from './dto';
import { Public } from '../shared/decorators';

@ApiTags('Telegram Auth')
@Controller('auth/telegram')
export class TelegramAuthController {
  constructor(private readonly telegramAuthService: TelegramAuthService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Authenticate with Telegram Mini App init data' })
  @ApiResponse({ status: 200, type: TelegramAuthResponseDto })
  async authenticate(@Body() dto: TelegramAuthRequestDto): Promise<TelegramAuthResponseDto> {
    return this.telegramAuthService.authenticateWithTelegram(dto);
  }
}
