import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const serviceApiKey =
      request.headers['x-service-api-key'] ||
      request.headers['x-api-key'] ||
      request.query.apiKey;

    const expectedApiKey = this.configService.get<string>('serviceApiKey');

    if (!serviceApiKey || serviceApiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid or missing service API key');
    }

    return true;
  }
}
