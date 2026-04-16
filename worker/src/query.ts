import { Env } from './types';
import { json, isValidDate, daysAgo, today } from './utils';

const MAX_RANGE_DAYS = 90;

function parseDateRange(url: URL): { from: string; to: string } | null {
  let from = url.searchParams.get('from') || daysAgo(30);
  let to = url.searchParams.get('to') || today();

  if (!isValidDate(from) || !isValidDate(to)) return null;
  if (from > to) return null;

  const diffMs = Date.parse(to) - Date.parse(from);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays > MAX_RANGE_DAYS) {
    from = daysAgo(MAX_RANGE_DAYS);
  }

  return { from, to };
}

export async function handleQuery(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.replace(/^\/query\//, '').split('/');
  const project = pathParts[0];
  const endpoint = pathParts[1];

  if (!project || !endpoint) return json({ error: 'not_found' }, 404);

  const range = parseDateRange(url);
  if (!range) return json({ error: 'invalid_range' }, 400);

  const { from, to } = range;

  if (endpoint === 'overview') {
    return handleOverview(env.DB, project, from, to);
  }
  if (endpoint === 'events') {
    return handleEvents(env.DB, project, from, to);
  }

  return json({ error: 'not_found' }, 404);
}

async function handleOverview(db: D1Database, project: string, from: string, to: string): Promise<Response> {
  const [totalRow, uniqueRow, topPages, topReferrers, daily, devicesRows, countriesRows, browsersRows] = await Promise.all([
    db
      .prepare(`SELECT COUNT(*) as total FROM events WHERE project = ? AND type = 'pageview' AND day >= ? AND day <= ?`)
      .bind(project, from, to)
      .first<{ total: number }>(),

    db
      .prepare(
        `SELECT COUNT(DISTINCT visitor) as unique_visitors FROM events WHERE project = ? AND type = 'pageview' AND day >= ? AND day <= ?`
      )
      .bind(project, from, to)
      .first<{ unique_visitors: number }>(),

    db
      .prepare(
        `SELECT url, COUNT(*) as views FROM events WHERE project = ? AND type = 'pageview' AND day >= ? AND day <= ? GROUP BY url ORDER BY views DESC LIMIT 10`
      )
      .bind(project, from, to)
      .all<{ url: string; views: number }>(),

    db
      .prepare(
        `SELECT referrer, COUNT(*) as views FROM events WHERE project = ? AND type = 'pageview' AND referrer IS NOT NULL AND day >= ? AND day <= ? GROUP BY referrer ORDER BY views DESC LIMIT 10`
      )
      .bind(project, from, to)
      .all<{ referrer: string; views: number }>(),

    db
      .prepare(
        `SELECT day, COUNT(*) as views FROM events WHERE project = ? AND type = 'pageview' AND day >= ? AND day <= ? GROUP BY day ORDER BY day ASC`
      )
      .bind(project, from, to)
      .all<{ day: string; views: number }>(),

    db
      .prepare(
        `SELECT device, COUNT(*) as count FROM events WHERE project = ? AND day >= ? AND day <= ? GROUP BY device`
      )
      .bind(project, from, to)
      .all<{ device: string; count: number }>(),

    db
      .prepare(
        `SELECT country, COUNT(*) as count FROM events WHERE project = ? AND country IS NOT NULL AND day >= ? AND day <= ? GROUP BY country ORDER BY count DESC LIMIT 20`
      )
      .bind(project, from, to)
      .all<{ country: string; count: number }>(),

    db
      .prepare(
        `SELECT browser, COUNT(*) as count FROM events WHERE project = ? AND day >= ? AND day <= ? GROUP BY browser`
      )
      .bind(project, from, to)
      .all<{ browser: string; count: number }>(),
  ]);

  const devices: Record<string, number> = {};
  for (const row of devicesRows.results) {
    devices[row.device] = row.count;
  }

  const countries: Record<string, number> = {};
  for (const row of countriesRows.results) {
    countries[row.country] = row.count;
  }

  const browsers: Record<string, number> = {};
  for (const row of browsersRows.results) {
    browsers[row.browser] = row.count;
  }

  return json({
    total_views: totalRow?.total ?? 0,
    unique_visitors: uniqueRow?.unique_visitors ?? 0,
    top_pages: topPages.results,
    top_referrers: topReferrers.results,
    daily: daily.results,
    devices,
    countries,
    browsers,
  });
}

async function handleEvents(db: D1Database, project: string, from: string, to: string): Promise<Response> {
  const result = await db
    .prepare(
      `SELECT name, COUNT(*) as count FROM events WHERE project = ? AND type = 'event' AND name IS NOT NULL AND day >= ? AND day <= ? GROUP BY name ORDER BY count DESC`
    )
    .bind(project, from, to)
    .all<{ name: string; count: number }>();

  return json({ events: result.results });
}
