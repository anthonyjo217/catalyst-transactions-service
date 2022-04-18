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
    const tokens = await this.getTokens(user);
    return { user, ...tokens };
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
      if (!user) {
        throw new UnauthorizedException();
      }

      const token = crypto.randomBytes(16).toString('hex');
      const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

      console.log(process.env.FRONTEND_URL);
      console.log(process.env.MAILGUN_API_KEY);
      console.log(process.env.MAILGUN_DOMAIN);

      const mailgunClient = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        url: 'https://api.eu.mailgun.net',
      });

      await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'ts-no-reply@tissini.com',
        to: 'jose.lopez@tissini.com',
        subject: 'Recuperar contraseña',
        text: `
        Hola ${user.name}!
        Para recuperar tu contraseña, haz click en el siguiente enlace:
        ${url}
      `,
      });

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }
}
