import type { OverviewResponse, EventsResponse, Period } from '../../shared/types';
import { today, daysAgo } from '../../shared/date';

export type { OverviewResponse, EventsResponse, Period };

const DEFAULT_API = 'https://jabb.vercel.app/api';

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function periodToFromTo(period: Period): { from: string; to: string } {
  const t = today();
  if (period === '1d') return { from: t, to: t };
  if (period === '7d') return { from: daysAgo(6), to: t };
  return { from: daysAgo(29), to: t };
}

export async function fetchOverview(
  project: string,
  period: Period,
  apiBase = DEFAULT_API
): Promise<OverviewResponse> {
  const { from, to } = periodToFromTo(period);
  return get<OverviewResponse>(
    `${apiBase}/${project}/overview?from=${from}&to=${to}`
  );
}

export async function fetchEvents(
  project: string,
  period: Period,
  apiBase = DEFAULT_API
): Promise<EventsResponse> {
  const { from, to } = periodToFromTo(period);
  return get<EventsResponse>(
    `${apiBase}/${project}/events?from=${from}&to=${to}`
  );
}
