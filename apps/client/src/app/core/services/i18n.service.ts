import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Locale = 'he' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);

  readonly currentLocale = signal<Locale>('he');
  readonly translations = signal<Record<string, string>>({});
  readonly isRtl = computed(() => this.currentLocale() === 'he');

  constructor() {
    effect(() => {
      const locale = this.currentLocale();
      const dir = locale === 'he' ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
    });

    this.loadTranslations('he');
  }

  async loadTranslations(locale: Locale): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<Record<string, string>>(`/assets/i18n/${locale}.json`)
      );
      this.translations.set(data);
      this.currentLocale.set(locale);
    } catch {
      // Fallback: keep current translations
    }
  }

  t(key: string): string {
    return this.translations()[key] ?? key;
  }

  toggleLocale(): void {
    const next: Locale = this.currentLocale() === 'he' ? 'en' : 'he';
    this.loadTranslations(next);
  }
}
