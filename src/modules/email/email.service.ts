import { Injectable } from '@nestjs/common';

import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import client from 'mailgun.js/client';

import { EmailOptions } from './interfaces/email-options.interface';

const MAILGUN = new Mailgun(FormData);

@Injectable()
export class EmailService {
  private mailGunClient: client;
  private domain: string;

  constructor() {
    this.mailGunClient = MAILGUN.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: 'https://api.mailgun.net/',
    });

    this.domain = process.env.MAILGUN_DOMAIN;
  }

  async sendEmail(options: EmailOptions) {
    const { to, subject, text, variables, template } = options;

    const response = await this.mailGunClient.messages.create(this.domain, {
      from: 'TISSINI SELLER <no-responder@notificaciones.tissini.cloud>',
      to,
      subject,
      text,
      template,
      'h:X-Mailgun-Variables': JSON.stringify(variables),
    });

    return response;
  }
}
