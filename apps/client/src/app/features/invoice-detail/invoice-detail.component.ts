import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { IInvoice, InvoiceStatus } from '@keshet/shared';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PdfViewerComponent } from '../../shared/components/pdf-viewer/pdf-viewer.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { InvoiceService } from '../../core/services/invoice.service';
import { FileService } from '../../core/services/file.service';
import { I18nService } from '../../core/services/i18n.service';
import { InvoiceInfoCardComponent } from './components/invoice-info-card/invoice-info-card.component';
import { AmountBreakdownCardComponent } from './components/amount-breakdown-card/amount-breakdown-card.component';

@Component({
  selector: 'app-invoice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    PdfViewerComponent,
    StatusPillComponent,
    InvoiceInfoCardComponent,
    AmountBreakdownCardComponent,
  ],
  template: `
    <app-header />
    <div class="detail-nav-bar">
      <div class="nav-start">
        <button class="back-btn" (click)="goBack()" [attr.aria-label]="i18n.t('detail.back')">
          <svg class="back-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        @if (invoice()) {
          <span class="nav-title">{{ invoice()!.supplier }} — {{ invoice()!.invoiceNumber }}</span>
        }
      </div>
      <div class="nav-end">
        @if (invoice()) {
          <div class="status-badge" [class]="'status-badge--' + statusKey()">
            <app-status-pill [status]="invoice()!.status" />
            <span class="status-label">{{ statusLabel() }}</span>
          </div>
        }
      </div>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span>{{ i18n.t('loading') }}</span>
      </div>
    } @else if (error()) {
      <div class="error-state">
        <span>{{ i18n.t('error.generic') }}: {{ error() }}</span>
      </div>
    } @else if (invoice()) {
      <div class="detail-content">
        <div class="pdf-panel">
          <app-pdf-viewer [fileUrl]="fileUrl()" />
        </div>
        <div class="cards-panel">
          <app-invoice-info-card [invoice]="invoice()!" />
          <app-amount-breakdown-card [invoice]="invoice()!" />
        </div>
      </div>
    }
  `,
  styleUrl: './invoice-detail.component.css',
})
export class InvoiceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly fileService = inject(FileService);
  protected readonly i18n = inject(I18nService);

  readonly invoice = signal<IInvoice | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly fileUrl = computed(() => {
    const inv = this.invoice();
    return inv ? this.fileService.getFileUrl(inv.fileStorageId) : '';
  });

  readonly statusKey = computed(() => {
    const inv = this.invoice();
    if (!inv) return '';
    switch (inv.status) {
      case InvoiceStatus.APPROVED: return 'approved';
      case InvoiceStatus.REJECTED: return 'rejected';
      case InvoiceStatus.PENDING_APPROVAL: return 'pending';
      case InvoiceStatus.IN_PROCESS: return 'in-process';
      default: return '';
    }
  });

  readonly statusLabel = computed(() => {
    const inv = this.invoice();
    if (!inv) return '';
    switch (inv.status) {
      case InvoiceStatus.APPROVED: return this.i18n.t('status.approved');
      case InvoiceStatus.REJECTED: return this.i18n.t('status.rejected');
      case InvoiceStatus.PENDING_APPROVAL: return this.i18n.t('status.pendingApproval');
      case InvoiceStatus.IN_PROCESS: return this.i18n.t('status.inProcess');
      default: return '';
    }
  });

  constructor() {
    const invoice$ = this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) => {
        this.loading.set(true);
        this.error.set(null);
        return this.invoiceService.getInvoiceById(id).pipe(
          catchError((err) => {
            this.error.set(err.message ?? 'Failed to load invoice');
            this.loading.set(false);
            return of(null);
          })
        );
      }),
      tap((inv) => {
        this.invoice.set(inv);
        this.loading.set(false);
      })
    );

    invoice$.subscribe();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
