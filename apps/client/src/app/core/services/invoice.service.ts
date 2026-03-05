import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { IInvoice, IPaginatedResponse, IStatusCounts, InvoiceStatus } from '@keshet/shared';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);

  readonly invoices = signal<IInvoice[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly statusCounts = signal<IStatusCounts>({
    all: 0,
    approved: 0,
    pending: 0,
    inProcess: 0,
    rejected: 0,
  });

  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<InvoiceStatus | null>(null);
  readonly dateRange = signal<{ from: string; to: string } | null>(null);

  private requestId = 0;

  readonly hasMore = computed(() => this.invoices().length < this.total());

  constructor() {
    toObservable(this.searchTerm)
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage.set(1);
        this.invoices.set([]);
        this.fetchInvoices();
      });
  }

  fetchInvoices(): void {
    const id = ++this.requestId;
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildParams();

    this.http
      .get<IPaginatedResponse<IInvoice>>('/api/invoices', { params })
      .pipe(
        tap((res) => {
          if (id !== this.requestId) return;
          if (this.currentPage() === 1) {
            this.invoices.set(res.items);
          } else {
            this.invoices.update((prev) => [...prev, ...res.items]);
          }
          this.total.set(res.total);
          this.loading.set(false);
        }),
        catchError((err) => {
          if (id === this.requestId) {
            this.error.set(err.message ?? 'Failed to load invoices');
            this.loading.set(false);
          }
          return of(null);
        })
      )
      .subscribe();
  }

  fetchStatusCounts(): void {
    this.http
      .get<IStatusCounts>('/api/invoices/status-counts')
      .pipe(
        tap((counts) => this.statusCounts.set(counts)),
        catchError(() => of(null))
      )
      .subscribe();
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.currentPage.update((p) => p + 1);
    this.fetchInvoices();
  }

  setStatusFilter(status: InvoiceStatus | null): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.invoices.set([]);
    this.fetchInvoices();
  }

  setDateRange(range: { from: string; to: string } | null): void {
    this.dateRange.set(range);
    this.currentPage.set(1);
    this.invoices.set([]);
    this.fetchInvoices();
  }

  getInvoiceById(id: string) {
    return this.http.get<IInvoice>(`/api/invoices/${id}`);
  }

  private buildParams(): HttpParams {
    let params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('pageSize', this.pageSize().toString());

    const search = this.searchTerm();
    if (search) params = params.set('search', search);

    const status = this.statusFilter();
    if (status) params = params.set('status', status);

    const range = this.dateRange();
    if (range) {
      params = params.set('dateFrom', range.from).set('dateTo', range.to);
    }

    return params;
  }
}
