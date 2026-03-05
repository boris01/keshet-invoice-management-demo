import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
} from '@angular/core';
import { IInvoice } from '@keshet/shared';
import { I18nService } from '../../../../core/services/i18n.service';
import { CurrencyIlsPipe } from '../../../../core/pipes/currency-ils.pipe';

@Component({
  selector: 'app-amount-breakdown-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyIlsPipe],
  template: `
    <div class="card">
      <h3 class="card-title">{{ i18n.t('detail.amountBreakdown') }}</h3>
      <table class="amount-table">
        <tbody>
          <tr>
            <td class="label">{{ i18n.t('detail.description') }}</td>
            <td class="amount">{{ invoice().amountBeforeVat | currencyIls }}</td>
          </tr>
          <tr class="subtotal-row">
            <td class="label">{{ i18n.t('detail.subtotal') }}</td>
            <td class="amount">{{ invoice().amountBeforeVat | currencyIls }}</td>
          </tr>
          <tr>
            <td class="label">{{ i18n.t('detail.vat') }}</td>
            <td class="amount">{{ invoice().vatAmount | currencyIls }}</td>
          </tr>
          <tr class="total-row">
            <td class="label">{{ i18n.t('detail.total') }}</td>
            <td class="amount">{{ invoice().totalAmount | currencyIls }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './amount-breakdown-card.component.css',
})
export class AmountBreakdownCardComponent {
  readonly invoice = input.required<IInvoice>();
  protected readonly i18n = inject(I18nService);
}
