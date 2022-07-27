import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class BearerTokenStrategy extends PassportStrategy(
  Strategy,
  'bearer-token',
) {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const secret = configService.get('JWT_SECRET');

    super({
      jwtFromRequest: (req: Request) => {
        const bearer = req.get('Authorization').split(' ')[1];

        try {
          jwtService.verify(bearer, {
            secret,
          });

          return bearer;
        } catch (error) {
          return null;
        }
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const { user } = payload;
    return user;
  }
}
