import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TelegramAuthRequestDto {
  @ApiProperty({ description: 'Telegram init data string from WebApp' })
  @IsString()
  initData: string;
}

export class TelegramUserDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;
}

export class TelegramAuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    telegramId: number;
    firstName: string;
    lastName: string;
    username: string;
  };
}
