import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header" role="banner">
      <div class="header-content">
        <div class="brand" aria-label="Keshet">
          <div class="logo-circle" role="img" aria-label="Keshet logo">
            <span class="logo-text" aria-hidden="true">קשת</span>
          </div>
        </div>
        <div class="header-end">
          <button class="lang-toggle" (click)="i18n.toggleLocale()" [attr.aria-label]="i18n.currentLocale() === 'he' ? 'Switch to English' : 'עבור לעברית'">
            {{ i18n.currentLocale() === 'he' ? 'EN' : 'עב' }}
          </button>
          <div class="icon-circle" role="img" aria-label="Application icon">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly i18n = inject(I18nService);
}
