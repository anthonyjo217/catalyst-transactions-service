import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

type GuardResponse = boolean | Promise<boolean> | Observable<boolean>;

@Injectable()
export class BearerTokenGuard extends AuthGuard('bearer-token') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext): GuardResponse {
    return super.canActivate(context);
  }
}
