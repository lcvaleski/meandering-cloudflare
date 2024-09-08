import { Env } from '../types';

export async function handleCreateVoice(request: Request, env: Env): Promise<Response> {
  try {

    // Get the file that has been uploaded by the user

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return new Response(JSON.stringify({details: "No file uploaded"}), {
          status: 400,
          statusText: "Bad request: No file uploaded",
          headers: { 'Content-Type': 'application/json'}
          });
    }   

    // Upload the file to R2 for possible future use

    await env.USER_UPLOADED_CLIPS.put('create_voice_audio.wav', file, {
      httpMetadata: { contentType: 'audio/wav' },
    });

    const url = "https://api.cartesia.ai/voices/clone/clip";
    const form = new FormData();
    form.append("clip", file); // This is important. Must be "clip". 
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2024-06-10',
        'X-API-Key': env.CARTESIA_API_KEY,
      },
      body: form
    };

    // Send the file to Cartesia.
    // The response is a list of doubles (embedding).
    
    let response = await fetch(url, options);
    return response;
    
  } catch (err) {
    if (err instanceof Error) {
      console.error(`${err.name}: ${err.message}`);

      return new Response(JSON.stringify({
        details: {
          message: err.message,
          name: err.name
        }
      }), {
        status: 500,
        statusText: "Internal Server Error",
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error('An unknown error occurred');
      return new Response(JSON.stringify({
        details: 'An unknown error occurred'
      }), {
        status: 500,
        statusText: "Internal Server Error",
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
