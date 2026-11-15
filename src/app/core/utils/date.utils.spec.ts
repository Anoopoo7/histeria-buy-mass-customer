import { isFutureDate, normalizeDateToIso, parseTimestampMs } from './date.utils';

describe('date.utils', () => {
  it('should correctly parse 10-digit Unix timestamp in seconds (e.g. 1795192200)', () => {
    const seconds = 1795192200;
    const ms = parseTimestampMs(seconds);
    expect(ms).toBe(1795192200000);

    const iso = normalizeDateToIso(seconds);
    expect(iso).toContain('2026');
  });

  it('should correctly parse numeric string in seconds ("1795192200")', () => {
    const ms = parseTimestampMs('1795192200');
    expect(ms).toBe(1795192200000);
  });

  it('should correctly parse 13-digit timestamp in milliseconds', () => {
    const msInput = 1795192200000;
    expect(parseTimestampMs(msInput)).toBe(1795192200000);
  });

  it('should correctly parse standard ISO string', () => {
    const iso = '2026-11-20T16:30:00.000Z';
    const expectedMs = new Date(iso).getTime();
    expect(parseTimestampMs(iso)).toBe(expectedMs);
    expect(normalizeDateToIso(iso)).toBe(iso);
  });

  it('should identify future timestamps', () => {
    const futureSeconds = Math.floor(Date.now() / 1000) + 3600;
    expect(isFutureDate(futureSeconds)).toBeTrue();

    const pastSeconds = Math.floor(Date.now() / 1000) - 3600;
    expect(isFutureDate(pastSeconds)).toBeFalse();
  });
});
