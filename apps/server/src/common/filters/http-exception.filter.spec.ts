import {
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function createMockHost(url: string) {
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockResponse = { status: mockStatus };
  const mockRequest = { url };

  const host = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  } as any;

  return { host, mockStatus, mockJson };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should return correct shape { statusCode, message, path, timestamp }', () => {
    const { host, mockJson } = createMockHost('/api/invoices');
    const exception = new NotFoundException('Invoice not found');

    filter.catch(exception, host);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Invoice not found',
        path: '/api/invoices',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle BadRequestException', () => {
    const { host, mockStatus, mockJson } = createMockHost('/api/invoices');
    const exception = new BadRequestException('Validation failed');

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        path: '/api/invoices',
      }),
    );
  });

  it('should handle generic HttpException', () => {
    const { host, mockStatus } = createMockHost('/api/test');
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(403);
  });

  it('should include ISO timestamp', () => {
    const { host, mockJson } = createMockHost('/api/invoices');
    const exception = new NotFoundException('Not found');

    filter.catch(exception, host);

    const body = mockJson.mock.calls[0][0];
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow();
  });
});
