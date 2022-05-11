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
import { RecoverPasswordDTO } from './dto/recover-password.dto';
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

  /**
   * Esta función setea las cookies de acceso y refresco de token y el usuario que está logueado.
   *
   *
   * @param response Response Esta variable es la que se utiliza para enviar la respuesta al cliente.
   * @param request Request Esta variable es la que se utiliza para obtener información del cliente.
   * @param access_token string Token de acceso
   * @param refresh_token string Token de refresco
   * @param user Employee Objeto del usuario
   */
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

  /**
   * Esta funcion loguea a un asesor
   */
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

  /**
   * Esta funcion es para usar en TApp v2 y loguea a las emprendedoras por medio
   * de su numero de telefono
   *
   * @param res Response
   * @param req Request
   * @param param2 string
   */
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

  /**
   * Esta funcion es para usar en TApp v2 y loguea a las emprendedoras por medio
   * de su token
   *
   * @param res Response
   * @param req Request
   * @param param2 string
   */
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

  /**
   * Esta funcion es para usar en TApp v2 y loguea a las emprendedoras por medio
   * de su id
   *
   * @param res Response
   * @param req Request
   * @param id number
   */
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

  /**
   * Esta funcion es para refrescar el token de acceso, pero no está implementada
   *
   * @param req Request
   * @returns any
   */
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

  /**
   * Esta funcion es para cerra la sesión de un usuario, borrando las cookies de acceso y refresco de token
   *
   *
   * @param req Request
   * @param res Response
   */
  @Delete('logout')
  async logout(@Req() req, @Res() res: Response) {
    await this.authService.logout(req.user._id);

    res
      .clearCookie('access_token', COOKIES_OPTIONS)
      .clearCookie('refresh_token', COOKIES_OPTIONS)
      .send({ success: true });

    req.logout();
  }

  /**
   * Esta funcion es para recuperar la contraseña de un usuario, enviando un correo con un link para cambiarla
   *
   * @param email string
   * @returns Promise<any>
   */
  @HttpCode(200)
  @IsPublic()
  @Get('recover-password/:email')
  async recoverPassword(@Param('email') email: string) {
    return this.authService.recoverPassword(email);
  }

  /**
   * Esta funcion es para cambiar la contraseña de un usuario, recibiendo el token y la nueva contraseña
   * @returns
   */
  @IsPublic()
  @HttpCode(200)
  @Post('reset-password/:token')
  async resetPassword(@Body() { token, password }: RecoverPasswordDTO) {
    return this.authService.resetPassword(token, password);
  }

  @IsPublic()
  @Get('check-email/:email')
  async checkEmail(@Param('email') email: string) {
    return this.authService.checkEmail(email);
  }
}
