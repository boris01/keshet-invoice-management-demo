import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { InvoiceService } from './invoice.service';
import { IInvoice, IPaginatedResponse, InvoiceStatus } from '@keshet/shared';

function mockInvoice(overrides: Partial<IInvoice> = {}): IInvoice {
  return {
    id: '1',
    invoiceNumber: 'INV-001',
    status: InvoiceStatus.APPROVED,
    description: 'Test invoice',
    supplier: 'Supplier A',
    issueDate: '2025-01-01',
    amountBeforeVat: 1000,
    vatAmount: 170,
    totalAmount: 1170,
    cost: 1000,
    fileStorageId: 'file-1',
    ...overrides,
  };
}

function mockPage(
  items: IInvoice[],
  total = items.length,
  page = 1,
): IPaginatedResponse<IInvoice> {
  return { items, total, page, pageSize: 20 };
}

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InvoiceService,
      ],
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Flush any outstanding requests to avoid verify errors
    httpMock.match(() => true);
  });

  it('should have correct initial state', () => {
    expect(service.invoices()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should set loading true then populate invoices on success', () => {
    const inv = mockInvoice();

    service.fetchInvoices();
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url === '/api/invoices');
    req.flush(mockPage([inv], 1));

    expect(service.loading()).toBe(false);
    expect(service.invoices()).toHaveLength(1);
    expect(service.invoices()[0].id).toBe('1');
    expect(service.total()).toBe(1);
  });

  it('should set error on HTTP failure', () => {
    service.fetchInvoices();
    const req = httpMock.expectOne((r) => r.url === '/api/invoices');
    req.error(new ProgressEvent('error'), {
      status: 500,
      statusText: 'Server Error',
    });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeTruthy();
  });

  it('should append invoices on loadMore', () => {
    // Initial fetch - page 1
    service.fetchInvoices();
    const req1 = httpMock.expectOne((r) => r.url === '/api/invoices');
    req1.flush(mockPage([mockInvoice({ id: '1' })], 3, 1));
    expect(service.invoices()).toHaveLength(1);

    // Load more - page 2
    service.loadMore();
    expect(service.currentPage()).toBe(2);

    const req2 = httpMock.expectOne((r) => r.url === '/api/invoices');
    req2.flush(mockPage([mockInvoice({ id: '2' })], 3, 2));
    expect(service.invoices()).toHaveLength(2);
  });

  it('should reset page and fetch on setStatusFilter', () => {
    service.currentPage.set(3);

    service.setStatusFilter(InvoiceStatus.APPROVED);
    expect(service.currentPage()).toBe(1);
    expect(service.invoices()).toEqual([]);

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/invoices' &&
        r.params.get('status') === 'APPROVED',
    );
    req.flush(mockPage([]));
  });

  it('should debounce searchTerm changes', async () => {
    // The constructor sets up toObservable(searchTerm).pipe(debounceTime(300))
    // which triggers fetchInvoices. We test that searchTerm change causes a fetch.
    service.searchTerm.set('test');

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Should have fired a fetch with search param
    const reqs = httpMock.match(
      (r) => r.url === '/api/invoices' && r.params.get('search') === 'test',
    );
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs.forEach((r) => r.flush(mockPage([])));
  });

  it('should fetch status counts', () => {
    service.fetchStatusCounts();
    const req = httpMock.expectOne('/api/invoices/status-counts');
    const counts = {
      all: 10,
      approved: 3,
      pending: 4,
      inProcess: 2,
      rejected: 1,
    };
    req.flush(counts);
    expect(service.statusCounts()).toEqual(counts);
  });
});
