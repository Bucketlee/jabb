export { today, daysAgo, isValidDate } from '../../shared/date';

const BOT_PATTERN = /bot|crawler|spider|crawling|headless|phantom|selenium|puppeteer|playwright|slurp|bingbot|googlebot|yandex|baidu|duckduck/i;

export function isBot(ua: string): boolean {
  return BOT_PATTERN.test(ua);
}

export function parseDevice(ua: string): string {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

// project를 salt에 포함해 cross-project 방문자 연결 차단.
// secret 유출 시 rainbow table 공격 범위도 project 단위로 분리됨.
export async function hashVisitor(
  ip: string,
  ua: string,
  project: string,
  secret: string,
): Promise<string> {
  const raw = `${ip}|${ua}|${project}|${secret}`;
  const encoded = new TextEncoder().encode(raw);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  const hex = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex;
}

export function collectCors(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function queryCors(allowedOrigin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization',
    Vary: 'Origin',
  };
}

export function json(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = collectCors(),
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
