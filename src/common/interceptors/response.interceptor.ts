import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((result) => {
        // If response is already formatted as envelope
        if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
          return result;
        }

        let message = 'Operation successful';
        let data = result;
        let meta = undefined;

        if (result && typeof result === 'object' && 'meta' in result && result.meta && ('items' in result || 'data' in result)) {
          meta = result.meta;
          data = result.data !== undefined ? result.data : result.items;
          message = result.message || message;
        } else if (result && typeof result === 'object' && 'message' in result && 'data' in result) {
          message = result.message;
          data = result.data;
        }

        return {
          success: true,
          message,
          data,
          ...(meta ? { meta } : {}),
        };
      }),
    );
  }
}
