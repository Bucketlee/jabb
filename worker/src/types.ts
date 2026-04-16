export type { CollectBody, OverviewResponse, EventsResponse, Period } from '../../shared/types';

export interface Env {
  DB: D1Database;
  SERVER_SECRET: string;
  WORKER_SECRET: string;
}
