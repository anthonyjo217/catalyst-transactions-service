import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req) => {
        if (!req || !req.cookies) {
          return null;
        }
        return req.cookies.refresh_token;
      },
      passReqToCallback: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * @deprecated
   *
   * @param request
   * @param payload
   * @returns
   */
  async validate(request, payload: any) {
    const token = request.cookies.refresh_token;
    const { data } = await firstValueFrom(
      this.httpService.post(
        `http://localhost:${process.env.USER_SERVICE_PORT}/users/refresh-token/${payload.user._id}`,
        {
          token,
        },
      ),
    );
    return data;
  }
}
