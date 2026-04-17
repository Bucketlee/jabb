import { Env } from './types';
import { daysAgo } from './utils';

export async function handleCron(env: Env): Promise<void> {
  const cutoff = daysAgo(90);
  // ip_limits는 분 단위로 쌓이므로 1일치 이전은 전부 정리
  const ipCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  await Promise.all([
    env.DB.prepare(`DELETE FROM events WHERE day < ?`).bind(cutoff).run(),
    env.DB.prepare(`DELETE FROM daily_counts WHERE day < ?`).bind(cutoff).run(),
    env.DB.prepare(`DELETE FROM ip_limits WHERE minute < ?`).bind(ipCutoff).run(),
  ]);
}
