import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { StatusPillComponent } from './status-pill.component';
import { InvoiceStatus } from '@keshet/shared';

@Component({
  imports: [StatusPillComponent],
  template: `<app-status-pill [status]="status" />`,
})
class TestHostComponent {
  status: InvoiceStatus = InvoiceStatus.APPROVED;
}

describe('StatusPillComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, StatusPillComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should show checkmark icon for APPROVED status', async () => {
    host.status = InvoiceStatus.APPROVED;
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.pill-icon');
    expect(icon).toBeTruthy();
    expect(icon!.textContent).toContain('\u2713');

    const pill = el.querySelector('.pill') as HTMLElement;
    expect(pill.style.background).toContain('var(--color-approved)');
  });

  it('should show X icon for REJECTED status', async () => {
    host.status = InvoiceStatus.REJECTED;
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.pill-icon');
    expect(icon).toBeTruthy();
    expect(icon!.textContent).toContain('\u2717');

    const pill = el.querySelector('.pill') as HTMLElement;
    expect(pill.style.background).toContain('var(--color-rejected)');
  });

  it('should show pending icon for PENDING_APPROVAL status', async () => {
    host.status = InvoiceStatus.PENDING_APPROVAL;
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.pill-icon');
    expect(icon!.textContent).toContain('\u25CB');
  });
});
