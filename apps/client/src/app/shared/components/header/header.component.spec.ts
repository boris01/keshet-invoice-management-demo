import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    // Flush I18nService constructor translation load
    const i18nReq = httpMock.match('/assets/i18n/he.json');
    i18nReq.forEach((r) => r.flush({ 'app.title': 'קשת' }));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render brand text with Hebrew letters', async () => {
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const brand = el.querySelector('.brand');
    expect(brand).toBeTruthy();
    expect(brand!.textContent).toContain('ק');
    expect(brand!.textContent).toContain('ש');
    expect(brand!.textContent).toContain('ת');
  });

  it('should have a language toggle button', async () => {
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector('.lang-toggle');
    expect(btn).toBeTruthy();
    // Default locale is 'he', so button shows 'EN'
    expect(btn!.textContent!.trim()).toBe('EN');
  });
});
