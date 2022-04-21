import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';

// ! MailgunJs imports
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);

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
  ) {}

  validateUser({ password, username }: LoginDTO) {
    return this.employeesService.validate(username, password);
  }

  async getTokens(user: User) {
    const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
    const access_token = this.jwtService.sign({ user }, { secret: JWT_SECRET });
    const refresh_token = this.jwtService.sign(
      { user },
      {
        secret: JWT_REFRESH_SECRET,
      },
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

  getAccessToken(user: User) {
    return this.jwtService.sign({ user }, { secret: process.env.JWT_SECRET });
  }

  async login({ password, username }: LoginDTO) {
    const user = await this.employeesService.validate(username, password);
    if (!user.is_logged_in) {
      await this.employeesService.setIsLoggedIn(user._id, true);
    } else {
      this.httpService.post(process.env.NOTIFICATION_URL, {
        type: 'LOGOUT',
        user: user._id,
      });
    }
    const tokens = await this.getTokens(user);
    return { user, ...tokens };
  }

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

  async recoverPassword(email: string) {
    try {
      const user = await this.employeesService.getByEmail(email);

      const token = crypto.randomBytes(64).toString('hex');
      const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      await this.employeesService.setRecoverToken(user._id, token);

      const mailgunClient = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        url: 'https://api.mailgun.net/',
      });

      await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'TISSINI SELLER <no-responder@notificaciones.tissini.cloud>',
        to: user.email,
        subject: 'Recuperación de contraseña',
        template: 'recover-password',
        text: 'Recuperar contraseña',
        'h:X-Mailgun-Variables': JSON.stringify({
          account: user.email,
          url,
        }),
      });

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async resetPassword(token: string, password: string) {
    const user = await this.employeesService.getByRecoverToken(token);
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.employeesService.setPassword(user._id, password);
    await this.employeesService.setRecoverToken(user._id, null);

    return {
      success: true,
    };
  }
}
