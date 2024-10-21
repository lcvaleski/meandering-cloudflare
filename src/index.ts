import { Env } from './types';
import { handleCreateVoice } from './routes/create-voice';
import { handleGenerateAudioSegment } from './routes/generate-audio-segment';
import { handleGenerateTextSegment } from './routes/generate-text-segment';
import { handleGenerateStory } from './routes/generate-story';

// Helper function to add CORS headers
function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new Response(response.body, {
    ...response,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return new Response(null, { headers });
    }

    if (request.method === 'POST') {
      switch (url.pathname) {
        case `/${ env.CREATE_VOICE_ROUTE.toString() }`:
          console.log(`Handling ${ env.CREATE_VOICE_ROUTE.toString() }`);
          return addCorsHeaders(await handleCreateVoice(request, env));

        case `/${ env.GENERATE_AUDIO_SEGMENT_ROUTE.toString() }`:
          console.log(`Handling ${ env.GENERATE_AUDIO_SEGMENT_ROUTE.toString() }`);
          return addCorsHeaders(await handleGenerateAudioSegment(request, env));

        case `/${ env.GENERATE_TEXT_SEGMENT_ROUTE.toString() }`:
          console.log(`Handling ${ env.GENERATE_TEXT_SEGMENT_ROUTE.toString() }`);
          return addCorsHeaders(await handleGenerateTextSegment(request, env));

        case `/${ env.GENERATE_STORY_ROUTE.toString() }`:
          console.log(`Handling ${ env.GENERATE_STORY_ROUTE.toString() }`);
          return addCorsHeaders(await handleGenerateStory(request, env));
      }
    }

    return addCorsHeaders(new Response('Not Found', { status: 404 }));
  }
};