import type { OverviewResponse, EventsResponse } from '../../../shared/types';

export type { OverviewResponse, EventsResponse };

function workerUrl(): string {
  const url = process.env.WORKER_URL;
  if (!url) throw new Error('WORKER_URL is not set');
  return url;
}

function workerSecret(): string {
  const secret = process.env.WORKER_SECRET;
  if (!secret) throw new Error('WORKER_SECRET is not set');
  return secret;
}

export async function fetchOverview(
  project: string,
  from: string,
  to: string,
): Promise<OverviewResponse> {
  const url = `${workerUrl()}/v1/query/${project}/overview?from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${workerSecret()}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`overview fetch failed: ${res.status}`);
  return res.json() as Promise<OverviewResponse>;
}

export async function fetchEvents(
  project: string,
  from: string,
  to: string,
): Promise<EventsResponse> {
  const url = `${workerUrl()}/v1/query/${project}/events?from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${workerSecret()}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`events fetch failed: ${res.status}`);
  return res.json() as Promise<EventsResponse>;
}
