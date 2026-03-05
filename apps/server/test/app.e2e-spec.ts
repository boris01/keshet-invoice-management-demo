import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, RequestMethod } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('App E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api', {
      exclude: [
        { path: 'health', method: RequestMethod.GET },
        { path: 'health/live', method: RequestMethod.GET },
      ],
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Wait for seeder to complete (generates 500 invoices with PDFs)
    await new Promise((resolve) => setTimeout(resolve, 35000));
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/invoices', () => {
    it('should return paginated data with correct shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/invoices')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeLessThanOrEqual(20);
      expect(res.body.total).toBe(500);
    });

    it('should filter by search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/invoices?search=Globex')
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      for (const item of res.body.items) {
        const matchesSearch =
          item.supplier.includes('Globex') ||
          item.description.includes('Globex');
        expect(matchesSearch).toBe(true);
      }
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/invoices?status=APPROVED')
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      for (const item of res.body.items) {
        expect(item.status).toBe('APPROVED');
      }
    });
  });

  describe('GET /api/invoices/status-counts', () => {
    it('should return counts summing to 500', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/invoices/status-counts')
        .expect(200);

      expect(res.body).toHaveProperty('all');
      expect(res.body).toHaveProperty('approved');
      expect(res.body).toHaveProperty('pending');
      expect(res.body).toHaveProperty('inProcess');
      expect(res.body).toHaveProperty('rejected');
      expect(res.body.all).toBe(500);
      expect(
        res.body.approved + res.body.pending + res.body.inProcess + res.body.rejected,
      ).toBe(500);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should return invoice detail for valid id', async () => {
      // First get an invoice from the list
      const listRes = await request(app.getHttpServer())
        .get('/api/invoices')
        .expect(200);

      const firstId = listRes.body.items[0].id;
      const res = await request(app.getHttpServer())
        .get(`/api/invoices/${firstId}`)
        .expect(200);

      expect(res.body.id).toBe(firstId);
      expect(res.body).toHaveProperty('invoiceNumber');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('supplier');
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/invoices/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });

  describe('GET /api/files/:id', () => {
    it('should return PDF stream for valid file id', async () => {
      // Get an invoice to find a fileStorageId
      const listRes = await request(app.getHttpServer())
        .get('/api/invoices')
        .expect(200);

      const fileStorageId = listRes.body.items[0].fileStorageId;
      const res = await request(app.getHttpServer())
        .get(`/api/files/${fileStorageId}`)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      // Check PDF magic bytes
      expect(res.body.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    });

    it('should return 404 for invalid file id', async () => {
      await request(app.getHttpServer())
        .get('/api/files/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
