/**
 * Utilities for normalizing timestamps and dates across BuyMass.
 * Handles both Unix timestamps in seconds (10 digits) and milliseconds (13 digits),
 * as well as ISO strings and Date instances.
 */

export function parseTimestampMs(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    if (isNaN(value) || value <= 0) return 0;
    // Numbers <= 10 digits (e.g. 1795192200) are Unix timestamps in SECONDS
    // Milliseconds in current epoch are 13 digits (> 1e11)
    return value < 100_000_000_000 ? Math.round(value * 1000) : Math.round(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    // Numeric string (e.g. "1795192200")
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (isNaN(num) || num <= 0) return 0;
      return num < 100_000_000_000 ? Math.round(num * 1000) : Math.round(num);
    }

    const parsed = new Date(trimmed).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function normalizeDateToIso(value: unknown): string {
  const ms = parseTimestampMs(value);
  if (ms > 0) {
    return new Date(ms).toISOString();
  }
  return typeof value === 'string' && value ? value : new Date().toISOString();
}

export function isFutureDate(value: unknown): boolean {
  const ms = parseTimestampMs(value);
  return ms > Date.now();
}
