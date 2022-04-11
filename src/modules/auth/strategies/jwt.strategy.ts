import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies) {
          req.res
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .status(401);
          return null;
        }

        try {
          jwtService.verify(req.cookies.access_token, {
            secret: process.env.JWT_SECRET,
          });

          return req.cookies.access_token;
        } catch (error) {
          req.res
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .status(401);
          return null;
        }
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
