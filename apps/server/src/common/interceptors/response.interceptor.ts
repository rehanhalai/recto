import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // If the result already has data/message structure, use it but unify
        const message = result?.message || 'Request successful';

        // Strip the message out of the main payload if present
        let data = result?.data !== undefined ? result.data : result;
        if (data && typeof data === 'object' && 'message' in data) {
          const { message: _msg, ...rest } = data;
          data = rest;
        }

        return {
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}
