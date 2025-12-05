import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  enabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
}));
