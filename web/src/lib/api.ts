export interface OverviewData {
  total_views: number;
  unique_visitors: number;
  top_pages: { url: string; views: number }[];
  top_referrers: { referrer: string; views: number }[];
  daily: { day: string; views: number }[];
  devices: Record<string, number>;
  countries: Record<string, number>;
  browsers: Record<string, number>;
}

export interface EventsData {
  events: { name: string; count: number }[];
}

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
): Promise<OverviewData> {
  const url = `${workerUrl()}/query/${project}/overview?from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${workerSecret()}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`overview fetch failed: ${res.status}`);
  return res.json() as Promise<OverviewData>;
}

export async function fetchEvents(
  project: string,
  from: string,
  to: string,
): Promise<EventsData> {
  const url = `${workerUrl()}/query/${project}/events?from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${workerSecret()}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`events fetch failed: ${res.status}`);
  return res.json() as Promise<EventsData>;
}
