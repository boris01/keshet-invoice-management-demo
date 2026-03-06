import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

export interface DateRange {
  from: string;
  to: string;
}

interface DayCell {
  date: Date;
  day: number;
  otherMonth: boolean;
}

@Component({
  selector: 'app-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="date-trigger"
      [class.active]="open()"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="i18n.t('filter.dateRange')"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      (click)="toggle()"
      (keydown.enter)="toggle()"
      (keydown.space)="toggle(); $event.preventDefault()"
      (keydown.escape)="close()"
    >
      <svg class="trigger-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/>
        <path d="M1.5 6h13M5 1v3M11 1v3"/>
      </svg>
      @if (rangeFrom() && rangeTo()) {
        <span>{{ formatDisplay(rangeFrom()!) }} – {{ formatDisplay(rangeTo()!) }}</span>
        <button class="clear-btn" (click)="clearRange($event)" aria-label="Clear date range">&#x2715;</button>
      } @else {
        <span>{{ i18n.t('filter.dateRange') }}</span>
      }
    </div>

    <div class="dropdown" [class.hidden]="!open()" role="dialog" aria-label="Calendar" (keydown.escape)="close()">
      <div class="calendar-header">
        <button class="nav-btn" (click)="prevMonth()" aria-label="Previous month">&#x276E;</button>
        <span class="month-label" aria-live="polite">{{ monthLabel() }}</span>
        <button class="nav-btn" (click)="nextMonth()" aria-label="Next month">&#x276F;</button>
      </div>
      <div class="weekdays" role="row" aria-hidden="true">
        @for (day of weekdayLabels(); track day) {
          <span class="weekday">{{ day }}</span>
        }
      </div>
      <div class="days" role="grid" [attr.aria-label]="monthLabel()">
        @for (cell of dayCells(); track cell.date.getTime()) {
          <button
            class="day-cell"
            [class.other-month]="cell.otherMonth"
            [class.today]="isToday(cell.date)"
            [class.range-start]="isRangeStart(cell.date)"
            [class.range-end]="isRangeEnd(cell.date)"
            [class.in-range]="isInRange(cell.date)"
            [attr.aria-label]="formatDayLabel(cell.date)"
            [attr.aria-pressed]="isRangeStart(cell.date) || isRangeEnd(cell.date)"
            (click)="onDayClick(cell.date)"
            (mouseenter)="onDayHover(cell.date)"
          >
            {{ cell.day }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './date-range-picker.component.css',
})
export class DateRangePickerComponent {
  readonly value = input<DateRange | null>(null);
  readonly rangeChanged = output<DateRange | null>();

  protected readonly i18n = inject(I18nService);
  private readonly elRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = signal(false);
  readonly viewDate = signal(new Date());
  readonly rangeFrom = signal<Date | null>(null);
  readonly rangeTo = signal<Date | null>(null);
  private hoverDate = signal<Date | null>(null);
  private selecting: 'from' | 'to' = 'from';
  private clearing = false;
  private clickOutsideHandler = (e: MouseEvent) => {
    if (!this.elRef.nativeElement.contains(e.target as Node)) {
      this.open.set(false);
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('click', this.clickOutsideHandler);
    });
  }

  readonly weekdayLabels = computed(() => {
    const locale = this.i18n.currentLocale();
    const base = new Date(2024, 0, 7); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'narrow' });
    });
  });

  readonly monthLabel = computed(() => {
    const d = this.viewDate();
    const locale = this.i18n.currentLocale();
    return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  readonly dayCells = computed((): DayCell[] => {
    const vd = this.viewDate();
    const year = vd.getFullYear();
    const month = vd.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: DayCell[] = [];

    // Previous month filler
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      cells.push({ date: new Date(year, month - 1, day), day, otherMonth: true });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), day: d, otherMonth: false });
    }

    // Next month filler
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ date: new Date(year, month + 1, d), day: d, otherMonth: true });
      }
    }

    return cells;
  });

  close(): void {
    this.open.set(false);
    document.removeEventListener('click', this.clickOutsideHandler);
  }

  toggle(): void {
    if (this.clearing) {
      this.clearing = false;
      return;
    }
    const isOpen = !this.open();
    this.open.set(isOpen);
    if (isOpen) {
      setTimeout(() => document.addEventListener('click', this.clickOutsideHandler));
    } else {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  }

  prevMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  onDayClick(date: Date): void {
    if (this.selecting === 'from') {
      this.rangeFrom.set(date);
      this.rangeTo.set(null);
      this.selecting = 'to';
    } else {
      if (date < this.rangeFrom()!) {
        this.rangeFrom.set(date);
        this.selecting = 'to';
      } else {
        this.rangeTo.set(date);
        this.selecting = 'from';
        this.hoverDate.set(null);
        this.emitRange();
        this.open.set(false);
        document.removeEventListener('click', this.clickOutsideHandler);
      }
    }
  }

  onDayHover(date: Date): void {
    if (this.selecting === 'to') {
      this.hoverDate.set(date);
    }
  }

  clearRange(event: Event): void {
    event.stopPropagation();
    this.clearing = true;
    this.rangeFrom.set(null);
    this.rangeTo.set(null);
    this.hoverDate.set(null);
    this.selecting = 'from';
    this.rangeChanged.emit(null);
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear();
  }

  isRangeStart(date: Date): boolean {
    const from = this.rangeFrom();
    return !!from && this.sameDay(date, from);
  }

  isRangeEnd(date: Date): boolean {
    const to = this.rangeTo() ?? (this.selecting === 'to' ? this.hoverDate() : null);
    return !!to && this.sameDay(date, to);
  }

  isInRange(date: Date): boolean {
    const from = this.rangeFrom();
    const to = this.rangeTo() ?? (this.selecting === 'to' ? this.hoverDate() : null);
    if (!from || !to) return false;
    const start = from < to ? from : to;
    const end = from < to ? to : from;
    return date > start && date < end;
  }

  formatDayLabel(date: Date): string {
    const locale = this.i18n.currentLocale();
    return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatDisplay(date: Date): string {
    const locale = this.i18n.currentLocale();
    return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();
  }

  private emitRange(): void {
    const from = this.rangeFrom();
    const to = this.rangeTo();
    if (from && to) {
      this.rangeChanged.emit({
        from: this.toIsoDate(from),
        to: this.toIsoDate(to),
      });
    }
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
