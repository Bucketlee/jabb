export type { Period } from '../../../shared/types';
export { today, daysAgo, periodToRange } from '../../../shared/date';

export function isPeriod(value: string): value is import('../../../shared/types').Period {
  return value === '1d' || value === '7d' || value === '30d';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
