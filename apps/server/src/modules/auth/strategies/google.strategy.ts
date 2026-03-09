import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../../../db/schema';
import { DRIZZLE } from '../../../../db/db.module';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('googleClientId')!,
      clientSecret: configService.get<string>('googleClientSecret')!,
      callbackURL: configService.get<string>('googleCallbackUrl')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value.replace(/=s\d+-c/g, '=s400-c'),
      googleId: id,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
