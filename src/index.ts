import { Env } from './types';
import { handleCreateVoice } from './routes/create-voice';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST') {
      switch (url.pathname) {
        case '/create-voice':
          return handleCreateVoice(request, env);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};