import { Env } from './types';
import { handleCreateVoice } from './routes/create-voice';
import { handleGenerateSample } from './routes/generate-sample';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (request.method === 'POST') {
      switch (url.pathname) {
        case '/create-voice':
          console.log("Handling /create-voice");
          return handleCreateVoice(request, env);
        case '/generate-sample':
          console.log("Handling /generate-sample");
          return handleGenerateSample(request, env);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};