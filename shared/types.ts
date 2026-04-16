export type Period = '1d' | '7d' | '30d';

export interface CollectBody {
  p: string;
  u: string;
  r?: string;
  t?: string;
  n?: string;
  m?: Record<string, unknown>;
}

export interface OverviewResponse {
  total_views: number;
  unique_visitors: number;
  top_pages: { url: string; views: number }[];
  top_referrers: { referrer: string; views: number }[];
  daily: { day: string; views: number }[];
  devices: Record<string, number>;
  countries: Record<string, number>;
  browsers: Record<string, number>;
}

export interface EventsResponse {
  events: { name: string; count: number }[];
}
