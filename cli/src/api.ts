const DEFAULT_API = "https://jabb.vercel.app/api";

export interface OverviewResponse {
  total_views: number;
  unique_visitors: number;
  top_pages: { url: string; views: number }[];
  top_referrers: { referrer: string; views: number }[];
  daily: { day: string; views: number }[];
  devices: Record<string, number>;
  countries: Record<string, number>;
}

export interface EventsResponse {
  events: { name: string; count: number }[];
}

function dateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

function today(): string {
  return dateStr(new Date());
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchOverview(
  project: string,
  period: "today" | "week" | "month",
  apiBase = DEFAULT_API
): Promise<OverviewResponse> {
  const from =
    period === "today"
      ? today()
      : period === "week"
        ? daysAgo(6)
        : daysAgo(29);
  const to = today();
  return get<OverviewResponse>(
    `${apiBase}/${project}/overview?from=${from}&to=${to}`
  );
}

export async function fetchEvents(
  project: string,
  period: "today" | "week" | "month",
  apiBase = DEFAULT_API
): Promise<EventsResponse> {
  const from =
    period === "today"
      ? today()
      : period === "week"
        ? daysAgo(6)
        : daysAgo(29);
  const to = today();
  return get<EventsResponse>(
    `${apiBase}/${project}/events?from=${from}&to=${to}`
  );
}
