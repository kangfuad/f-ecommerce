import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should transform raw data into standard response envelope', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({ name: 'Sony FX3' }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((res) => {
      expect(res.status).toBe('success');
      expect(res.message).toBe('Operasi berhasil diproses.');
      expect(res.data).toEqual({ name: 'Sony FX3' });
      expect(res.meta).toBeDefined();
      expect(res.meta.timestamp).toBeDefined();
      done();
    });
  });

  it('should preserve custom message and pagination', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () =>
        of({
          message: 'Daftar katalog berhasil diambil.',
          data: [{ id: '1' }],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            limit: 10,
          },
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((res) => {
      expect(res.status).toBe('success');
      expect(res.message).toBe('Daftar katalog berhasil diambil.');
      expect(res.data).toEqual([{ id: '1' }]);
      expect(res.meta.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        limit: 10,
      });
      done();
    });
  });
});
