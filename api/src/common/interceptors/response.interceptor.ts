import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Wraps every successful controller response in a consistent envelope:
 * { success, message, data }
 *
 * Controllers may optionally return { message, data } to customize the message,
 * otherwise a sensible default is used.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          'data' in result
        ) {
          return {
            success: true,
            message: (result as any).message,
            data: (result as any).data,
          };
        }
        return {
          success: true,
          message: 'Request successful',
          data: result ?? null,
        };
      }),
    );
  }
}
