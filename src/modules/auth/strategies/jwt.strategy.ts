import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies) {
          req.res
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .end();
          return null;
        }
        return req.cookies.access_token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const { user } = payload;
    return user;
  }
}
