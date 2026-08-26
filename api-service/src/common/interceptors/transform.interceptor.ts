import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto, PaginationMetaDto } from '../dto/api-response.dto';

interface RawResponse<T> {
  data?: T;
  message?: string;
  pagination?: PaginationMetaDto;
  meta?: any;
  [key: string]: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((response: any) => {
        // If response is already formatted as ApiResponseDto, return as is
        if (
          response &&
          typeof response === 'object' &&
          response.status &&
          response.meta &&
          response.meta.timestamp
        ) {
          return response;
        }

        let message = 'Operasi berhasil diproses.';
        let data: any = response;
        let pagination: PaginationMetaDto | undefined = undefined;

        if (response && typeof response === 'object') {
          if (response.message && typeof response.message === 'string') {
            message = response.message;
          }

          if (response.pagination) {
            pagination = response.pagination;
          }

          if (response.meta && response.meta.pagination) {
            pagination = response.meta.pagination;
          }

          if ('data' in response) {
            data = response.data;
          } else if (response.message && Object.keys(response).length === 1) {
            data = null;
          }
        }

        return {
          status: 'success',
          message,
          data: data !== undefined ? data : null,
          meta: {
            timestamp: new Date().toISOString(),
            ...(pagination ? { pagination } : {}),
          },
        };
      }),
    );
  }
}
