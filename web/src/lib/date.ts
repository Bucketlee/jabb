export type Period = 'today' | '7d' | '30d';

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function periodToRange(period: Period): { from: string; to: string } {
  const t = today();
  if (period === 'today') return { from: t, to: t };
  if (period === '7d') return { from: daysAgo(6), to: t };
  return { from: daysAgo(29), to: t };
}

export function isPeriod(value: string): value is Period {
  return value === 'today' || value === '7d' || value === '30d';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
