import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <span class="brand-letter" style="color: #ea4335">ק</span><span
            class="brand-letter" style="color: #fbbc05">ש</span><span
            class="brand-letter" style="color: #34a853">ת</span>
        </div>
        <div class="header-end">
          <button class="lang-toggle" (click)="i18n.toggleLocale()">
            {{ i18n.currentLocale() === 'he' ? 'EN' : 'עב' }}
          </button>
          <div class="icon-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
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
