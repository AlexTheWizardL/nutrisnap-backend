import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { AuthProvider } from '../shared/enums';
import { TelegramAuthRequestDto, TelegramUserDto, TelegramAuthResponseDto } from './dto';

@Injectable()
export class TelegramAuthService {
  private readonly logger = new Logger(TelegramAuthService.name);
  private readonly botToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }

  async authenticateWithTelegram(dto: TelegramAuthRequestDto): Promise<TelegramAuthResponseDto> {
    // Parse and validate init data
    const telegramUser = this.validateInitData(dto.initData);

    if (!telegramUser) {
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { providerId: String(telegramUser.id), provider: AuthProvider.TELEGRAM },
    });

    if (!user) {
      // Create new user from Telegram data
      user = this.userRepository.create({
        email: `tg_${telegramUser.id}@telegram.user`,
        firstName: telegramUser.first_name || '',
        lastName: telegramUser.last_name || '',
        provider: AuthProvider.TELEGRAM,
        providerId: String(telegramUser.id),
        isActive: true,
      });
      await this.userRepository.save(user);
      this.logger.log(`Created new user from Telegram: ${telegramUser.id}`);
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      telegramId: telegramUser.id,
      username: telegramUser.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        telegramId: telegramUser.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: telegramUser.username || '',
      },
    };
  }

  private validateInitData(initData: string): TelegramUserDto | null {
    try {
      // Parse the init data
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');

      // Sort parameters alphabetically
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Create secret key from bot token
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.botToken)
        .digest();

      // Calculate expected hash
      const expectedHash = crypto
        .createHmac('sha256', secretKey)
        .update(sortedParams)
        .digest('hex');

      // For development, allow bypass if no bot token configured
      if (!this.botToken) {
        this.logger.warn('Bot token not configured, skipping signature verification');
      } else if (hash !== expectedHash) {
        this.logger.error('Invalid Telegram init data signature');
        return null;
      }

      // Check auth_date is not too old (24 hours)
      const authDate = params.get('auth_date');
      if (authDate) {
        const authTimestamp = parseInt(authDate, 10);
        const now = Math.floor(Date.now() / 1000);
        if (now - authTimestamp > 86400) {
          this.logger.error('Telegram auth data expired');
          return null;
        }
      }

      // Parse user data
      const userDataStr = params.get('user');
      if (!userDataStr) {
        this.logger.error('No user data in init data');
        return null;
      }

      const userData: TelegramUserDto = JSON.parse(userDataStr);
      return userData;
    } catch (error) {
      this.logger.error('Failed to validate init data', error);
      return null;
    }
  }
}
