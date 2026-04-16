import { NextRequest, NextResponse } from 'next/server';

const PROJECT_ID_RE = /^[a-z0-9-]{3,30}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function proxyToWorker(
  request: NextRequest,
  project: string,
  endpoint: string,
): Promise<NextResponse> {
  const WORKER_URL = process.env.WORKER_URL;
  const WORKER_SECRET = process.env.WORKER_SECRET;

  if (!WORKER_URL || !WORKER_SECRET) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 });
  }

  if (!PROJECT_ID_RE.test(project)) {
    return NextResponse.json({ error: 'invalid_project' }, { status: 400 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  const upstreamUrl = new URL(`${WORKER_URL}/v1/query/${project}/${endpoint}`);
  upstreamUrl.searchParams.set('from', from);
  upstreamUrl.searchParams.set('to', to);

  const res = await fetch(upstreamUrl.toString(), {
    headers: { Authorization: `Bearer ${WORKER_SECRET}` },
    next: { revalidate: 60 },
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { error: 'upstream_error' };
  }

  return NextResponse.json(data, { status: res.ok ? res.status : 502 });
}
