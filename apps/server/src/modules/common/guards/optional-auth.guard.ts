import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.refreshToken;

    if (!token) {
      request.user = undefined;
      return true; // allow unauthenticated users
    }

    try {
      const secret = this.configService.get<string>('refreshToken.secret')!;
      const decoded = jwt.verify(token, secret);
      request.user = decoded;
    } catch (e) {
      request.user = undefined; // invalid token, treat as unauthenticated
    }

    return true; // Always allow
  }
}
