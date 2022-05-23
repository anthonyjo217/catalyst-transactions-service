import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';

import { firstValueFrom } from 'rxjs';

import { USER_TYPES } from '~core/dto/create-from-netsuite.dto';
import { User } from '~core/interfaces/user.interface';

import { CustomerLeadsService } from '../customer-leads/customer-leads.service';
import { EmployeesService } from '../employees/employees.service';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private employeesService: EmployeesService,
    private customerLeadsService: CustomerLeadsService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Valida la existencia de un usuario en la base de datos
   * @returns {Promise<Employee>} user
   */
  validateUser({ password, username }: LoginDTO) {
    return this.employeesService.validate(username, password);
  }

  /**
   * Obtiene los tokens de un usuario
   * @param user User
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async getTokens(user: User) {
    const jwtSecret = this.configService.get('JWT_SECRET');
    const refreshSecret = this.configService.get('REFRESH_SECRET');

    const access_token = this.jwtService.sign({ user }, { secret: jwtSecret });
    const refresh_token = this.jwtService.sign(
      { user },
      { secret: refreshSecret },
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.stage === USER_TYPES.SALESREP) {
      await this.employeesService.setRefreshToken(user._id, refresh_token);
    } else {
      await this.customerLeadsService.setRefreshToken(user._id, refresh_token);
    }
    return { access_token, refresh_token };
  }

  /**
   * Genera un token de acceso
   * @param user User
   * @returns {string} token
   */
  getAccessToken(user: User) {
    const jwtSecret = this.configService.get('JWT_SECRET');
    return this.jwtService.sign({ user }, { secret: jwtSecret });
  }

  /**
   * Loguea un usuario
   */
  async login({ password, username }: LoginDTO) {
    const user = await this.employeesService.validate(username, password);

    const tokens = await this.getTokens(user as User);

    // Se valida que el usuario este logueado
    // Si no está se actualiza el usuario en la base de datos
    if (!user.is_logged_in) {
      await this.employeesService.setIsLoggedIn(user._id, true);
    } else {
      const url = this.configService.get('NOTIFICATION_SERVICE');
      // Si el usuario está logueado, se manda una notificación que cierra
      // cualquier sesión abierta
      firstValueFrom(
        this.httpService.post(`${url}/v1/auth/logout/${user._id}`),
      );
    }

    return { user, ...tokens };
  }

  /**
   * Actualiza el estado de un usuario
   * @param id number - id del usuario
   */
  async logout(id: number) {
    return await this.employeesService.setIsLoggedIn(id, false);
  }

  async phoneLogin(mobilephone: string) {
    const user = await this.customerLeadsService.validateByProperty(
      'mobilephone',
      mobilephone,
    );
    return this.getTokens(user);
  }

  async tokenLogin(token: string) {
    const user = await this.customerLeadsService.validateByProperty(
      'token',
      token,
    );
    return this.getTokens(user);
  }

  async idLogin(id: number) {
    const user = await this.customerLeadsService.validateByProperty('id', id);
    return this.getTokens(user);
  }

  /**
   * Envia un correo de recuperación de contraseña
   *
   * @param email string
   * @returns {Promise<{success: boolean}>}
   */
  async recoverPassword(email: string) {
    try {
      const user = await this.employeesService.getByEmail(email);

      if (user) {
        // Se crea un token para recuperar la contraseña y se guarda en la base de datos
        const token = crypto.randomBytes(64).toString('hex');
        const frontendUrl = this.configService.get('FRONTEND_URL');
        const url = `${frontendUrl}/reset-password/${token}`;
        await this.employeesService.setRecoverToken(user._id, token);

        const mailOptions = {
          to: user.email,
          subject: 'Recuperación de contraseña',
          template: 'recover-password',
          'h:X-Mailgun-Variables': {
            account: user.email,
            url,
          },
        };

        const notService = this.configService.get('NOTIFICATION_SERVICE');
        await firstValueFrom(
          this.httpService.post(`${notService}v1/email`, mailOptions),
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   * @param token string
   * @param password string
   * @returns {Promise<{success: boolean}>}
   */
  async resetPassword(token: string, password: string) {
    // Se obtiene el usuario de la base de datos
    const user = await this.employeesService.getByRecoverToken(token);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Se actualiza la contraseña y se elimina el token
    await this.employeesService.setPassword(user._id, password);
    await this.employeesService.setRecoverToken(user._id, null);

    return {
      success: true,
    };
  }

  async checkEmail(email: string) {
    const user = await this.employeesService.checkEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { user };
  }
}
