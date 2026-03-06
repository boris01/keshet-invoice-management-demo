import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { StatusCountBoxComponent } from '../status-count-box/status-count-box.component';
import { DateRangePickerComponent, DateRange } from '../../../../shared/components/date-range-picker/date-range-picker.component';
import { InvoiceStatus } from '@keshet/shared';

@Component({
  selector: 'app-controls-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusCountBoxComponent, DateRangePickerComponent],
  template: `
    <nav class="controls-bar" aria-label="Invoice filters">
      <div class="status-boxes" role="group" aria-label="Filter by status">
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

      <div class="controls-end">
        <div class="filter-search-group">
          <app-date-range-picker (rangeChanged)="onDateRangeChange($event)" />
          <div class="search-wrapper">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5"/>
              <path d="M11 11l3.5 3.5"/>
            </svg>
            <input
              class="search-input"
              type="text"
              [placeholder]="i18n.t('search.placeholder')"
              [attr.aria-label]="i18n.t('search.placeholder')"
              [value]="invoiceService.searchTerm()"
              (input)="onSearch($event)"
            />
          </div>
          <button class="icon-btn filter-btn" aria-label="Filter" title="Filter">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M1 2h14l-5.5 6.5V14l-3-1.5V8.5L1 2z"/>
            </svg>
          </button>
        </div>
        <div class="view-toggle" role="group" aria-label="View mode">
          <button class="icon-btn" [class.active]="viewMode() === 'list'" [attr.aria-pressed]="viewMode() === 'list'" (click)="viewMode.set('list')" aria-label="List view">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <rect x="1" y="2" width="16" height="2.5" rx="1"/>
              <rect x="1" y="7.5" width="16" height="2.5" rx="1"/>
              <rect x="1" y="13" width="16" height="2.5" rx="1"/>
            </svg>
          </button>
          <button class="icon-btn" [class.active]="viewMode() === 'grid'" [attr.aria-pressed]="viewMode() === 'grid'" (click)="viewMode.set('grid')" aria-label="Grid view">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="7" height="7" rx="1"/>
              <rect x="10" y="1" width="7" height="7" rx="1"/>
              <rect x="1" y="10" width="7" height="7" rx="1"/>
              <rect x="10" y="10" width="7" height="7" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './controls-bar.component.css',
})
export class ControlsBarComponent {
  protected readonly invoiceService = inject(InvoiceService);
  protected readonly i18n = inject(I18nService);

  readonly viewMode = signal<'grid' | 'list'>('list');

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.invoiceService.searchTerm.set(value);
  }

  onStatusFilter(status: InvoiceStatus | null): void {
    this.invoiceService.setStatusFilter(status);
  }

  onDateRangeChange(range: DateRange | null): void {
    this.invoiceService.setDateRange(range);
  }
}
