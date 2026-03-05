import { CurrencyIlsPipe } from './currency-ils.pipe';

describe('CurrencyIlsPipe', () => {
  let pipe: CurrencyIlsPipe;

  beforeEach(() => {
    pipe = new CurrencyIlsPipe();
  });

  it('should format 5000 as ILS currency string', () => {
    const result = pipe.transform(5000);
    // Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })
    // produces something like "‏5,000 ₪" or "₪ 5,000" depending on env
    expect(result).toContain('5,000');
    expect(result).toContain('₪');
  });

  it('should format large numbers with commas', () => {
    const result = pipe.transform(1234567);
    expect(result).toContain('1,234,567');
    expect(result).toContain('₪');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should handle zero', () => {
    const result = pipe.transform(0);
    expect(result).toContain('0');
    expect(result).toContain('₪');
  });
});
