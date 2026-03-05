import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { StatusCountBoxComponent } from '../status-count-box/status-count-box.component';
import { InvoiceStatus } from '@keshet/shared';

@Component({
  selector: 'app-controls-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusCountBoxComponent],
  template: `
    <div class="controls-bar">
      <div class="controls-end">
        <div class="view-toggle">
          <button class="icon-btn" [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" title="Grid view">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="1" width="7" height="7" rx="1"/>
              <rect x="10" y="1" width="7" height="7" rx="1"/>
              <rect x="1" y="10" width="7" height="7" rx="1"/>
              <rect x="10" y="10" width="7" height="7" rx="1"/>
            </svg>
          </button>
          <button class="icon-btn" [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" title="List view">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="2" width="16" height="2.5" rx="1"/>
              <rect x="1" y="7.5" width="16" height="2.5" rx="1"/>
              <rect x="1" y="13" width="16" height="2.5" rx="1"/>
            </svg>
          </button>
        </div>

        <div class="filter-search-group">
          <button class="icon-btn filter-btn" title="Filter">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M1 2h14l-5.5 6.5V14l-3-1.5V8.5L1 2z"/>
            </svg>
          </button>
          <div class="search-wrapper">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="7" cy="7" r="5.5"/>
              <path d="M11 11l3.5 3.5"/>
            </svg>
            <input
              class="search-input"
              type="text"
              [placeholder]="i18n.t('search.placeholder')"
              [value]="invoiceService.searchTerm()"
              (input)="onSearch($event)"
            />
          </div>
          <div class="date-range-wrapper">
            <input
              class="date-input"
              type="date"
              [value]="dateFrom()"
              (change)="onDateFromChange($event)"
            />
            <span class="date-sep">-</span>
            <input
              class="date-input"
              type="date"
              [value]="dateTo()"
              (change)="onDateToChange($event)"
            />
          </div>
        </div>
      </div>

      <div class="status-boxes">
        <app-status-count-box
          [count]="invoiceService.statusCounts().all"
          [label]="i18n.t('status.all')"
          [active]="invoiceService.statusFilter() === null"
          (clicked)="onStatusFilter(null)"
        />
        <app-status-count-box
          [count]="invoiceService.statusCounts().approved"
          [label]="i18n.t('status.approved')"
          [active]="invoiceService.statusFilter() === 'APPROVED'"
          (clicked)="onStatusFilter('APPROVED')"
        />
        <app-status-count-box
          [count]="invoiceService.statusCounts().inProcess"
          [label]="i18n.t('status.inProcess')"
          [active]="invoiceService.statusFilter() === 'IN_PROCESS'"
          (clicked)="onStatusFilter('IN_PROCESS')"
        />
        <app-status-count-box
          [count]="invoiceService.statusCounts().pending"
          [label]="i18n.t('status.pendingApproval')"
          [active]="invoiceService.statusFilter() === 'PENDING_APPROVAL'"
          (clicked)="onStatusFilter('PENDING_APPROVAL')"
        />
      </div>
    </div>
  `,
  styleUrl: './controls-bar.component.css',
})
export class ControlsBarComponent {
  protected readonly invoiceService = inject(InvoiceService);
  protected readonly i18n = inject(I18nService);

  readonly viewMode = signal<'grid' | 'list'>('list');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.invoiceService.searchTerm.set(value);
  }

  onStatusFilter(status: InvoiceStatus | null): void {
    this.invoiceService.setStatusFilter(status);
  }

  onDateFromChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dateFrom.set(value);
    this.updateDateRange();
  }

  onDateToChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dateTo.set(value);
    this.updateDateRange();
  }

  private updateDateRange(): void {
    const from = this.dateFrom();
    const to = this.dateTo();
    if (from && to) {
      this.invoiceService.setDateRange({ from, to });
    } else if (!from && !to) {
      this.invoiceService.setDateRange(null);
    }
  }
}
