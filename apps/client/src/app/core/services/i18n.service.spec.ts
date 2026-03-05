import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        I18nService,
      ],
    });
    service = TestBed.inject(I18nService);
    httpMock = TestBed.inject(HttpTestingController);

    // Constructor calls loadTranslations('he')
    const initReq = httpMock.expectOne('/assets/i18n/he.json');
    initReq.flush({ 'app.title': 'קשת', greeting: 'שלום' });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should default to "he" locale', () => {
    expect(service.currentLocale()).toBe('he');
  });

  it('should compute isRtl as true for "he"', () => {
    expect(service.isRtl()).toBe(true);
  });

  it('should toggle locale to "en" and load translations', async () => {
    service.toggleLocale();
    const req = httpMock.expectOne('/assets/i18n/en.json');
    req.flush({ 'app.title': 'Keshet', greeting: 'Hello' });

    // Wait for async loadTranslations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.currentLocale()).toBe('en');
    expect(service.isRtl()).toBe(false);
    expect(service.t('greeting')).toBe('Hello');
  });

  it('should return key as fallback when translation is missing', () => {
    expect(service.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should return translation when key exists', () => {
    expect(service.t('greeting')).toBe('שלום');
  });
});
