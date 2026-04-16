import { Env } from './types';
import { daysAgo } from './utils';

export async function handleCron(env: Env): Promise<void> {
  const cutoff = daysAgo(90);

  await Promise.all([
    env.DB.prepare(`DELETE FROM events WHERE day < ?`).bind(cutoff).run(),
    env.DB.prepare(`DELETE FROM daily_counts WHERE day < ?`).bind(cutoff).run(),
  ]);
}
