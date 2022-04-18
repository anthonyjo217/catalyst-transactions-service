import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { IsPublic } from '~core/decorators/is-public.decorator';

import { CustomerLead } from '~core/interfaces/customer-lead.interface';
import { Employee } from '~core/interfaces/employee.interface';

import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { PhonenumberLoginDTO } from './dto/phonenumber-login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

const EXP_TIME = 1000 * 60 * 60 * 24 * 365; // ! 1 year
export const COOKIES_OPTIONS: CookieOptions = {
  sameSite: 'none',
  maxAge: EXP_TIME,
  secure: true,
  domain: `tissini.${process.env.APP_MODE == 'dev' ? 'build' : 'cloud'}`,
};

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private sendCookiesResponse(
    response: Response,
    request: Request,
    access_token: string,
    refresh_token: string,
    user?: Employee | CustomerLead,
  ) {
    const origin = request.get('origin');

    response
      .cookie('access_token', access_token, COOKIES_OPTIONS)
      .cookie('refresh_token', refresh_token, COOKIES_OPTIONS)
      .header('Access-Control-Allow-Credentials', 'true')
      .header('Access-Control-Allow-Origin', origin)
      .header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
      .header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
      )
      .send({ success: true, access_token, refresh_token, user });
  }

  @IsPublic()
  @Post('login')
  async login(
    @Res() res: Response,
    @Req() req: Request,
    @Body() loginDTO: LoginDTO,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(
      loginDTO,
    );

    this.sendCookiesResponse(res, req, access_token, refresh_token, user);
  }

  @IsPublic()
  @Post('phonenumber-login')
  async phoneLogin(
    @Res() res: Response,
    @Req() req: Request,
    @Body() { username }: PhonenumberLoginDTO,
  ) {
    const { access_token, refresh_token } = await this.authService.phoneLogin(
      username,
    );

    this.sendCookiesResponse(res, req, access_token, refresh_token);
  }

  @IsPublic()
  @Post('token-login')
  async tokenLogin(
    @Res() res: Response,
    @Req() req: Request,
    @Body() { username }: PhonenumberLoginDTO,
  ) {
    const { access_token, refresh_token } = await this.authService.tokenLogin(
      username,
    );

    this.sendCookiesResponse(res, req, access_token, refresh_token);
  }

  @IsPublic()
  @Post(':id')
  async idLogin(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    const { access_token, refresh_token } = await this.authService.idLogin(id);

    this.sendCookiesResponse(res, req, access_token, refresh_token);
  }

  @IsPublic()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  async refreshToken(@Req() req) {
    const { access_token, refresh_token } = await this.authService.getTokens(
      req.user,
    );
    return {
      access_token,
      refresh_token,
      success: true,
    };
  }

  @Delete('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    res
      .clearCookie('access_token', COOKIES_OPTIONS)
      .clearCookie('refresh_token', COOKIES_OPTIONS)
      .send({ success: true });

    req.logout();
  }

  @HttpCode(200)
  @IsPublic()
  @Post('recover-password/:email')
  async recoverPassword(@Param('email') email: string) {
    return this.authService.recoverPassword(email);
  }
}
