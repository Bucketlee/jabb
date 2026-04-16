import type { Period } from './types';

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

export function periodToRange(period: Period): { from: string; to: string } {
  const t = today();
  if (period === '1d') return { from: t, to: t };
  if (period === '7d') return { from: daysAgo(6), to: t };
  return { from: daysAgo(29), to: t };
}
