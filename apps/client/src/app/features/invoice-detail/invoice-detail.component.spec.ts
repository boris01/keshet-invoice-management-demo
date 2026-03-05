import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { InvoiceDetailComponent } from './invoice-detail.component';
import { IInvoice, InvoiceStatus } from '@keshet/shared';

function mockInvoice(): IInvoice {
  return {
    id: 'abc-123',
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
  };
}

describe('InvoiceDetailComponent', () => {
  let component: InvoiceDetailComponent;
  let fixture: ComponentFixture<InvoiceDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => (key === 'id' ? 'abc-123' : null),
            }),
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(InvoiceDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.match(() => true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const req = httpMock.expectOne('/api/invoices/abc-123');
    req.flush(mockInvoice());

    httpMock.match(() => true);
  });

  it('should load invoice from route param', () => {
    const req = httpMock.expectOne('/api/invoices/abc-123');
    req.flush(mockInvoice());

    expect(component.invoice()).toBeTruthy();
    expect(component.invoice()!.id).toBe('abc-123');
    expect(component.loading()).toBe(false);
  });

  it('should set error on load failure', () => {
    const req = httpMock.expectOne('/api/invoices/abc-123');
    req.error(new ProgressEvent('error'), {
      status: 404,
      statusText: 'Not Found',
    });

    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBe(false);
  });
});
