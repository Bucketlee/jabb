import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WORKER_URL;
const WORKER_SECRET = process.env.WORKER_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  const { project } = await params;
  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  if (!WORKER_URL || !WORKER_SECRET) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 });
  }

  const upstreamUrl = `${WORKER_URL}/v1/query/${project}/overview?from=${from}&to=${to}`;
  const res = await fetch(upstreamUrl, {
    headers: { Authorization: `Bearer ${WORKER_SECRET}` },
    next: { revalidate: 60 },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
