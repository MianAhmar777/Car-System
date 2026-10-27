import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response already has custom format structure with message
        if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
          return res;
        }

        let message = 'Operation successful';
        let data = res;

        if (res && typeof res === 'object' && res._message) {
          message = res._message;
          delete res._message;
        }

        return {
          success: true,
          data: data ?? null,
          message,
        };
      }),
    );
  }
}
