import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'mailcatcher',
  port: parseInt(process.env.MAIL_PORT || '1025', 10),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER || '',
  password: process.env.MAIL_PASSWORD || '',
  fromName: process.env.MAIL_FROM_NAME || 'NestJS Boilerplate',
  fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@example.com',
  defaultLocale: process.env.DEFAULT_LOCALE || 'en',
}));
