import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';

import * as rawbody from 'raw-body';

export const PlainBody = createParamDecorator<any, ExecutionContext>(
  async (data, ctx) => {
    const request: Request = ctx.switchToHttp().getRequest();

    if (request.readable) {
      try {
        const body = (await rawbody(request)).toString().trim();

        const parsed = JSON.parse(body);
        console.log({ parsed });

        return data
          ? plainToInstance(data, parsed, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            })
          : parsed;
      } catch (error) {
        throw error;
      }
    }

    throw new HttpException('Body isnt parseable', HttpStatus.BAD_REQUEST);
  },
);
