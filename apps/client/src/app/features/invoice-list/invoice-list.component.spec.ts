import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { InvoiceListComponent } from './invoice-list.component';
import { InvoiceService } from '../../core/services/invoice.service';
import { IInvoice, InvoiceStatus } from '@keshet/shared';

function mockInvoice(overrides: Partial<IInvoice> = {}): IInvoice {
  return {
    id: '1',
    invoiceNumber: 'INV-001',
    status: InvoiceStatus.APPROVED,
    description: 'Test',
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

const emptyPage = { items: [], total: 0, page: 1, pageSize: 20 };
const emptyCounts = { all: 0, approved: 0, pending: 0, inProcess: 0, rejected: 0 };

function flushAll(httpMock: HttpTestingController, invoiceItems: IInvoice[] = []): void {
  httpMock.match(() => true).forEach((r) => {
    if (r.request.url.includes('status-counts')) {
      r.flush(emptyCounts);
    } else if (r.request.url.includes('i18n')) {
      r.flush({});
    } else {
      r.flush({ items: invoiceItems, total: invoiceItems.length, page: 1, pageSize: 20 });
    }
  });
}

describe('InvoiceListComponent', () => {
  let component: InvoiceListComponent;
  let fixture: ComponentFixture<InvoiceListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(InvoiceListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.match(() => true);
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    flushAll(httpMock);
    await new Promise((r) => setTimeout(r, 350));
    flushAll(httpMock);
  });

  it('should call fetchInvoices and fetchStatusCounts on init', async () => {
    // The constructor fires fetchInvoices() and fetchStatusCounts() immediately
    const invoiceReqs = httpMock.match((r) => r.url === '/api/invoices');
    expect(invoiceReqs.length).toBeGreaterThanOrEqual(1);
    invoiceReqs.forEach((r) => r.flush(emptyPage));

    const countReqs = httpMock.match((r) => r.url.includes('/api/invoices/status-counts'));
    expect(countReqs.length).toBe(1);
    countReqs[0].flush(emptyCounts);

    flushAll(httpMock);

    await new Promise((r) => setTimeout(r, 350));
    flushAll(httpMock);
  });

  it('should render table when invoices exist', async () => {
    const invoiceService = TestBed.inject(InvoiceService);
    const inv = mockInvoice();

    flushAll(httpMock, [inv]);
    await new Promise((r) => setTimeout(r, 350));
    flushAll(httpMock, [inv]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(invoiceService.invoices().length).toBeGreaterThanOrEqual(1);
    const el: HTMLElement = fixture.nativeElement;
    const table = el.querySelector('app-invoice-table');
    expect(table).toBeTruthy();
  });
});
