import { Env } from './types';
import { handleCollect } from './collect';
import { handleQuery } from './query';
import { handleCron } from './cron';
import { json, corsHeaders } from './utils';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { method, pathname } = { method: request.method, pathname: url.pathname };

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (method === 'POST' && pathname === '/collect') {
      return handleCollect(request, env);
    }

    if (method === 'GET' && pathname.startsWith('/query/')) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.WORKER_SECRET}`) {
        return json({ error: 'unauthorized' }, 401);
      }
      return handleQuery(request, env);
    }

    return json({ error: 'not_found' }, 404);
  },

  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await handleCron(env);
  },
};
