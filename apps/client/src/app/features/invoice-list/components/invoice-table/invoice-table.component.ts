import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  viewChild,
  ElementRef,
  inject,
  DestroyRef,
} from '@angular/core';
import { IInvoice } from '@keshet/shared';
import { CurrencyIlsPipe } from '../../../../core/pipes/currency-ils.pipe';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-invoice-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyIlsPipe],
  template: `
    <div class="table-wrapper">
      <table class="invoice-table">
        <thead>
          <tr>
            <th scope="col" class="col-desc">{{ i18n.t('table.description') }}</th>
            <th scope="col" class="col-supplier">{{ i18n.t('table.supplier') }}</th>
            <th scope="col" class="col-cost">{{ i18n.t('table.cost') }}</th>
          </tr>
        </thead>
        <tbody>
          @for (invoice of invoices(); track invoice.id; let i = $index) {
            <tr
              class="invoice-row"
              [class.selected]="selectedInvoice()?.id === invoice.id"
              [class.alt]="i % 2 === 1"
              [attr.aria-selected]="selectedInvoice()?.id === invoice.id"
              [attr.aria-label]="invoice.description + ' — ' + invoice.supplier"
              tabindex="0"
              (click)="onRowClick(invoice)"
              (keydown.enter)="onRowClick(invoice)"
              (keydown.space)="onRowClick(invoice); $event.preventDefault()"
            >
              <td class="col-desc">
                <div class="desc-cell">
                  @switch (invoice.status) {
                    @case ('APPROVED') {
                      <span class="status-icon approved" role="img" aria-label="Approved">
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" stroke-width="1.5" fill="none"/>
                        </svg>
                      </span>
                    }
                    @case ('REJECTED') {
                      <span class="status-icon rejected" role="img" aria-label="Rejected">
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M3 3l6 6M9 3l-6 6" stroke="white" stroke-width="1.5"/>
                        </svg>
                      </span>
                    }
                    @case ('IN_PROCESS') {
                      <span class="status-icon in-process" role="img" aria-label="In process">
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" stroke-width="1.5" fill="none"/>
                        </svg>
                      </span>
                    }
                    @case ('PENDING_APPROVAL') {
                      <span class="status-icon pending" role="img" aria-label="Pending approval"></span>
                    }
                  }
                  <div class="desc-text">
                    <span class="desc-title">{{ invoice.description }}</span>
                    <span class="desc-date">{{ formatDate(invoice.issueDate) }}</span>
                  </div>
                </div>
              </td>
              <td class="col-supplier">{{ invoice.supplier }}</td>
              <td class="col-cost">{{ invoice.cost | currencyIls }}</td>
            </tr>
          }
        </tbody>
      </table>
      <div #sentinel class="sentinel"></div>
    </div>
  `,
  styleUrl: './invoice-table.component.css',
})
export class InvoiceTableComponent {
  readonly invoices = input.required<IInvoice[]>();
  readonly selectedInvoice = input<IInvoice | null>(null);
  readonly select = output<IInvoice>();
  readonly navigateToDetail = output<IInvoice>();
  readonly loadMore = output<void>();

  protected readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

  private clickTimer: ReturnType<typeof setTimeout> | null = null;
  private observer: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      const el = this.sentinel()?.nativeElement;
      if (!el) return;

      this.observer?.disconnect();
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.loadMore.emit();
          }
        },
        { rootMargin: '200px' }
      );
      this.observer.observe(el);
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });
  }

  onRowClick(invoice: IInvoice): void {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
      this.navigateToDetail.emit(invoice);
      return;
    }
    this.clickTimer = setTimeout(() => {
      this.clickTimer = null;
      this.select.emit(invoice);
    }, 350);
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}
