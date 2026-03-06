import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { InvoiceStatus } from '@keshet/shared';

interface StatusConfig {
  color: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-status-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pill" [style.background]="config().color" [attr.aria-label]="config().label" role="img">
      <span class="pill-icon" aria-hidden="true">{{ config().icon }}</span>
    </span>
  `,
  styleUrl: './status-pill.component.css',
})
export class StatusPillComponent {
  readonly status = input.required<InvoiceStatus>();

  readonly config = computed<StatusConfig>(() => {
    switch (this.status()) {
      case InvoiceStatus.APPROVED:
        return { color: 'var(--color-approved)', icon: '\u2713', label: 'Approved' };
      case InvoiceStatus.REJECTED:
        return { color: 'var(--color-rejected)', icon: '\u2717', label: 'Rejected' };
      case InvoiceStatus.PENDING_APPROVAL:
        return { color: 'var(--color-pending)', icon: '\u25CB', label: 'Pending' };
      case InvoiceStatus.IN_PROCESS:
        return { color: 'var(--color-in-process)', icon: '\u2713', label: 'In Process' };
      default:
        return { color: '#9e9e9e', icon: '\u25CB', label: 'Unknown' };
    }
  });
}
