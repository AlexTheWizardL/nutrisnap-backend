import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { User } from '@/modules/user/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      name: { givenName: string; familyName: string };
      emails: [{ value: string }];
      id: string;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, id } = profile;

    const user: Partial<User> = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      providerId: id,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done(null, { user, accessToken, refreshToken } as any);
  }
}
