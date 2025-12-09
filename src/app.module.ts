import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import configs from './modules/config';
import { DatabaseModule } from './modules/database/database.module';
import { SharedModule } from './modules/shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { MealModule } from './modules/meal/meal.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { FoodAnalysisModule } from './modules/food-analysis/food-analysis.module';
import { TelegramAuthModule } from './modules/telegram-auth/telegram-auth.module';
import { JwtAuthGuard } from './modules/shared/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule,
    SharedModule,
    UserModule,
    AuthModule,
    MailModule,
    MealModule,
    NutritionModule,
    FoodAnalysisModule,
    TelegramAuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
