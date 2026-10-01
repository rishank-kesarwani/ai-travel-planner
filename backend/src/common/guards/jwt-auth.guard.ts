import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Optional() private configService?: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context?: ExecutionContext) {
    const isOptionalAuth = context
      ? this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
          context.getHandler(),
          context.getClass(),
        ])
      : false;

    const publicAccessEnabled = this.configService
      ? this.configService.get<boolean>('publicAccessEnabled', true)
      : process.env.PUBLIC_ACCESS_ENABLED !== 'false';

    if (isOptionalAuth && publicAccessEnabled) {
      return user || null;
    }

    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Authentication token is missing or invalid')
      );
    }
    return user;
  }
}
