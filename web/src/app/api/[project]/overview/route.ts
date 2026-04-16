import { NextRequest } from 'next/server';
import { proxyToWorker } from '../../../../lib/proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  const { project } = await params;
  return proxyToWorker(request, project, 'overview');
}
