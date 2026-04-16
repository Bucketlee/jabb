export interface Env {
  DB: D1Database;
  SERVER_SECRET: string;
  WORKER_SECRET: string;
}

export interface CollectBody {
  p: string;
  u: string;
  r?: string;
  t?: string;
  n?: string;
  m?: Record<string, unknown>;
}
