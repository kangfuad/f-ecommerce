import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/faqs (Public)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/faqs')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.meta.timestamp).toBeDefined();
      });
  });

  it('GET /api/v1/regions (Public)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/regions?type=provinces')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.some((p: any) => p.name === 'DKI JAKARTA')).toBe(true);
      });
  });

  it('GET /api/v1/user/profile without JWT returns 401 Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/api/v1/user/profile')
      .expect(401)
      .expect((res) => {
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('otentikasi');
      });
  });
});
