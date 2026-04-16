import { Env, CollectBody } from './types';
import { isBot, parseDevice, parseBrowser, hashVisitor, today, json } from './utils';

const PROJECT_ID_RE = /^[a-z0-9-]{3,30}$/;
const EVENT_NAME_RE = /^[\w.\-:]{1,64}$/;
const DAILY_LIMIT = 10_000;
const MAX_PAYLOAD_BYTES = 2048;
const MAX_META_BYTES = 500;
const MAX_URL_LEN = 500;
const MAX_REFERRER_LEN = 200;

function sanitizeUrl(raw: string): string {
  return raw.replace(/[\x00-\x1f\x7f]/g, '').slice(0, MAX_URL_LEN);
}

function sanitizeReferrer(raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const normalized = `${u.protocol}//${u.host}${u.pathname}`;
    return normalized.slice(0, MAX_REFERRER_LEN);
  } catch {
    return null;
  }
}

function sanitizeEventName(raw: string | undefined | null): string | null {
  if (!raw || !EVENT_NAME_RE.test(raw)) return null;
  return raw;
}

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

  if (!body.u || typeof body.u !== 'string') {
    return json({ error: 'invalid' }, 400);
  }
  const url = sanitizeUrl(body.u);

  const rawOrigin = request.headers.get('origin');
  if (!rawOrigin) {
    return json({ error: 'missing_origin' }, 400);
  }
  let originHost: string;
  try {
    originHost = new URL(rawOrigin).host;
  } catch {
    return json({ error: 'invalid_origin' }, 400);
  }

  const ua = request.headers.get('user-agent') ?? '';
  if (isBot(ua)) return json({ ok: true });

  const day = today();
  const now = Date.now();

  // first-write-wins: origin 없으면 클레임, 있으면 소유자 확인
  const [claimResult, ownerResult] = await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO projects (project, owner_origin, created_at) VALUES (?, ?, ?)
       ON CONFLICT (project) DO NOTHING`
    ).bind(project, originHost, now),
    env.DB.prepare(
      `SELECT owner_origin FROM projects WHERE project = ?`
    ).bind(project),
  ]);

  void claimResult;

  const ownerRow = ownerResult.results[0] as { owner_origin: string } | undefined;
  if (ownerRow && ownerRow.owner_origin !== originHost) {
    return json({ error: 'forbidden' }, 403);
  }

  const rateLimitResult = await env.DB.prepare(
    `INSERT INTO daily_counts (project, day, count) VALUES (?, ?, 1)
     ON CONFLICT (project, day) DO UPDATE SET count = count + 1
     RETURNING count`
  )
    .bind(project, day)
    .first<{ count: number }>();

  if (!rateLimitResult || rateLimitResult.count > DAILY_LIMIT) {
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
  const name = type === 'event' ? sanitizeEventName(body.n) : null;
  const referrer = sanitizeReferrer(body.r);

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
