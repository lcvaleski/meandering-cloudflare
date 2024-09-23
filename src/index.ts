import { Env } from './types';
import { handleCreateVoice } from './routes/create-voice';
import { handleGenerateAudioSegment } from './routes/generate-audio-segment';
import { handleGenerateTextSegment } from './routes/generate-text-segment';
import { handleGenerateStory } from './routes/generate-story';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (request.method === 'POST') {
      switch (url.pathname) {
        case `/${ env.CREATE_VOICE_ROUTE.toString() }`:
          console.log(`Handling ${ env.CREATE_VOICE_ROUTE.toString() }`);
          return handleCreateVoice(request, env);

        case `/${ env.GENERATE_AUDIO_SEGMENT_ROUTE.toString() }`:
          console.log(`Handling ${ env.GENERATE_AUDIO_SEGMENT_ROUTE.toString() }`);
          return handleGenerateAudioSegment(request, env);

        case `/${ env.GENERATE_TEXT_SEGMENT_ROUTE.toString() }`:
          console.log(`Handling ${ env.GENERATE_TEXT_SEGMENT_ROUTE.toString() }`);
          return handleGenerateTextSegment(request, env);

        case `/${ env.GENERATE_STORY_ROUTE.toString() }`:
          console.log(`Handling ${ env.GENERATE_STORY_ROUTE.toString() }`);
          return handleGenerateStory(request, env);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};