import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
} from '@angular/core';
import { IInvoice } from '@keshet/shared';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-invoice-info-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3 class="card-title">{{ i18n.t('detail.invoiceInfo') }}</h3>
      <div class="card-row">
        <span class="label">{{ i18n.t('detail.invoiceDate') }}</span>
        <span class="value">{{ invoice().issueDate }}</span>
      </div>
      <div class="card-row">
        <span class="label">{{ i18n.t('detail.invoiceNumber') }}</span>
        <span class="value">{{ invoice().invoiceNumber }}</span>
      </div>
      <div class="card-row">
        <span class="label">{{ i18n.t('detail.description') }}</span>
        <span class="value">{{ invoice().description }}</span>
      </div>
    </div>
  `,
  styleUrl: './invoice-info-card.component.css',
})
export class InvoiceInfoCardComponent {
  readonly invoice = input.required<IInvoice>();
  protected readonly i18n = inject(I18nService);
}
