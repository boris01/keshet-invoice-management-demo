import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyIls', pure: true })
export class CurrencyIlsPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return this.formatter.format(value);
  }
}
