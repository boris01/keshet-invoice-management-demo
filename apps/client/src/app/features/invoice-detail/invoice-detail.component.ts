import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-invoice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent],
  template: `
    <app-header />
    <main class="placeholder">
      <p>Invoice Detail — coming soon</p>
    </main>
  `,
  styles: `
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      color: var(--color-text-secondary);
    }
  `,
})
export class InvoiceDetailComponent {}
