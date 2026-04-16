import { Env, CollectBody } from './types';
import { isBot, parseDevice, parseBrowser, hashVisitor, today, json } from './utils';

const PROJECT_ID_RE = /^[a-z0-9-]{3,30}$/;
const DAILY_LIMIT = 10_000;
const MAX_PAYLOAD_BYTES = 2048;
const MAX_META_BYTES = 500;

export async function handleCollect(request: Request, env: Env): Promise<Response> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_BYTES) {
    return json({ error: 'payload_too_large' }, 413);
  }

  let body: CollectBody;
  try {
    const text = await request.text();
    if (text.length > MAX_PAYLOAD_BYTES) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text) as CollectBody;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const project = body.p;
  if (!project || !PROJECT_ID_RE.test(project)) {
    return json({ error: 'invalid_project' }, 400);
  }

  const url = body.u;
  if (!url || typeof url !== 'string') {
    return json({ error: 'invalid' }, 400);
  }

  const ua = request.headers.get('user-agent') ?? '';
  if (isBot(ua)) return json({ ok: true });

  const day = today();

  const rateLimitResult = await env.DB.prepare(
    `INSERT INTO daily_counts (project, day, count) VALUES (?, ?, 1)
     ON CONFLICT (project, day) DO UPDATE SET count = count + 1 WHERE count < ?
     RETURNING count`
  )
    .bind(project, day, DAILY_LIMIT)
    .first<{ count: number }>();

  if (!rateLimitResult) {
    return json({ error: 'rate_limit' }, 429);
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwarded = forwardedFor ? forwardedFor.split(',')[0].trim() : '';
  const ip = request.headers.get('cf-connecting-ip') ?? firstForwarded;
  const country = request.headers.get('cf-ipcountry') ?? null;
  const device = parseDevice(ua);
  const browser = parseBrowser(ua);
  const visitor = await hashVisitor(ip, ua, env.SERVER_SECRET);

  const type = body.t === 'event' ? 'event' : 'pageview';
  const name = type === 'event' ? (body.n ?? null) : null;
  const referrer = body.r ?? null;

  let meta: string | null = null;
  if (body.m) {
    const serialized = JSON.stringify(body.m);
    if (serialized.length <= MAX_META_BYTES) {
      meta = serialized;
    }
  }

  await env.DB.prepare(
    `INSERT INTO events (project, type, name, url, referrer, country, device, browser, visitor, meta, day)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(project, type, name, url, referrer, country, device, browser, visitor, meta, day)
    .run();

  return json({ ok: true });
}
