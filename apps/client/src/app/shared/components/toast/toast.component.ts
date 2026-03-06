import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" role="status" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" [attr.role]="toast.type === 'error' ? 'alert' : null">
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Dismiss notification">&times;</button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
