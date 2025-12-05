import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

type Locale = 'en' | 'uk';
type Template = 'welcome' | 'password-reset' | 'email-verification';

@Injectable()
export class MailService {
  private readonly defaultLocale: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.defaultLocale = this.configService.get<Locale>('mail.defaultLocale', 'en');
  }

  async sendWelcomeEmail(to: string, firstName: string, locale?: Locale): Promise<void> {
    const currentLocale = locale || this.defaultLocale;

    await this.mailerService.sendMail({
      to,
      subject: this.getSubject('welcome', currentLocale as Locale),
      template: `./${currentLocale}/welcome`,
      context: {
        firstName,
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
    locale?: string,
  ): Promise<void> {
    const currentLocale = locale || this.defaultLocale;
    const resetUrl = `${this.configService.get('app.url')}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to,
      subject: this.getSubject('password-reset', currentLocale as Locale),
      template: `./${currentLocale}/password-reset`,
      context: {
        firstName,
        resetUrl,
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationToken: string,
    locale?: string,
  ): Promise<void> {
    const currentLocale = locale || this.defaultLocale;
    const verificationUrl = `${this.configService.get('app.url')}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to,
      subject: this.getSubject('email-verification', currentLocale as Locale),
      template: `./${currentLocale}/email-verification`,
      context: {
        firstName,
        verificationUrl,
      },
    });
  }

  private getSubject(template: Template, locale: Locale): string {
    const subjects = {
      en: {
        welcome: 'Welcome to NestJS Boilerplate',
        'password-reset': 'Password Reset Request',
        'email-verification': 'Email Verification',
      },
      uk: {
        welcome: 'Ласкаво просимо до NestJS Boilerplate',
        'password-reset': 'Запит на скидання пароля',
        'email-verification': 'Підтвердження електронної пошти',
      },
    };

    return subjects[locale]?.[template] || subjects.en[template];
  }
}
