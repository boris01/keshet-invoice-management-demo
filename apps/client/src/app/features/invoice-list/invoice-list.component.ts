import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IInvoice } from '@keshet/shared';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ControlsBarComponent } from './components/controls-bar/controls-bar.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';
import { PdfSidePanelComponent } from './components/pdf-side-panel/pdf-side-panel.component';
import { InvoiceService } from '../../core/services/invoice.service';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-invoice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    ControlsBarComponent,
    InvoiceTableComponent,
    PdfSidePanelComponent,
    LoadingSkeletonComponent,
  ],
  template: `
    <app-header />
    <app-controls-bar />
    <main id="main-content" class="content-area">
      <div class="table-container" [class.with-panel]="selectedInvoice()">
        @if (!invoiceService.loading() && invoiceService.invoices().length === 0) {
          <div class="empty-state" role="status">לא נמצאו חשבוניות</div>
        }
        <app-invoice-table
          [class.hidden]="invoiceService.loading() || invoiceService.invoices().length === 0"
          [invoices]="invoiceService.invoices()"
          [selectedInvoice]="selectedInvoice()"
          (invoiceSelect)="onSelectInvoice($event)"
          (navigateToDetail)="onNavigateToDetail($event)"
          (loadMore)="invoiceService.loadMore()"
        />
        <app-loading-skeleton [class.hidden]="!invoiceService.loading()" />
      </div>
      <app-pdf-side-panel
        [class.hidden]="!selectedInvoice()"
        [fileUrl]="selectedFileUrl()"
        (panelClose)="selectedInvoice.set(null)"
        (expand)="onNavigateToDetail(selectedInvoice()!)"
      />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content-area {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .table-container {
      flex: 1;
      overflow-y: auto;
      min-width: 0;
      transition: flex 0.2s ease;
    }

    .table-container.with-panel {
      flex: 1;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 40vh;
      font-size: 1.125rem;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .content-area {
        flex-direction: column-reverse;
      }

      .table-container.with-panel {
        flex: 1;
      }
    }
  `,
})
export class InvoiceListComponent {
  protected readonly invoiceService = inject(InvoiceService);
  private readonly fileService = inject(FileService);
  private readonly router = inject(Router);

  readonly selectedInvoice = signal<IInvoice | null>(null);
  readonly selectedFileUrl = signal('');

  constructor() {
    this.invoiceService.fetchInvoices();
    this.invoiceService.fetchStatusCounts();
  }

  onSelectInvoice(invoice: IInvoice): void {
    if (this.selectedInvoice()?.id === invoice.id) {
      this.selectedInvoice.set(null);
      this.selectedFileUrl.set('');
      return;
    }
    this.selectedInvoice.set(invoice);
    this.selectedFileUrl.set(this.fileService.getFileUrl(invoice.fileStorageId));
  }

  onNavigateToDetail(invoice: IInvoice): void {
    this.router.navigate(['/invoice', invoice.id]);
  }
}
