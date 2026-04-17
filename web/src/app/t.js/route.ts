import { NextResponse } from 'next/server';
import { getTrackingScript } from '@/lib/tracking-script';

export function GET() {
  const script = getTrackingScript();
  if (!script) {
    return new NextResponse('// WORKER_URL not configured', {
      status: 500,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
    });
  }

  return new NextResponse(script.source, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
