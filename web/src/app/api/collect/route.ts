import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WORKER_URL;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  if (!WORKER_URL) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 500, headers: CORS_HEADERS });
  }

  const body = await request.text();

  const forwardHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const ip =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    '';
  if (ip) forwardHeaders['x-forwarded-for'] = ip;

  const ua = request.headers.get('user-agent') ?? '';
  if (ua) forwardHeaders['user-agent'] = ua;

  const res = await fetch(`${WORKER_URL}/collect`, {
    method: 'POST',
    headers: forwardHeaders,
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS });
}
