import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { API_KEY_KEY } from '~core/decorators/api-key.decorator';

/**
 * API Key Guard
 *
 * @export Guard
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Valida si la petición tiene una API Key válida
   * Can Activate
   *
   * @param {ExecutionContext} context
   * @returns {(Promise<boolean> | boolean)}
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const shouldHaveApiKey = this.reflector.getAllAndOverride<string[]>(
      API_KEY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!shouldHaveApiKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const XApiKey = request.get('X-API-KEY');
    const apiKey = process.env.API_KEY;

    return apiKey === XApiKey;
  }
}
