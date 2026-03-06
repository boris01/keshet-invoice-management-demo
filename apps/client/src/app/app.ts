import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `
    <a class="skip-nav" href="#main-content">Skip to main content</a>
    <router-outlet />
    <app-toast />
  `,
  styles: `
    .skip-nav {
      position: absolute;
      inset-inline-start: -9999px;
      z-index: 9999;
      padding: var(--space-sm) var(--space-md);
      background: var(--color-text);
      color: white;
      font-weight: 600;
      text-decoration: none;
      border-radius: var(--radius);
    }
    .skip-nav:focus {
      inset-inline-start: var(--space-md);
      inset-block-start: var(--space-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
