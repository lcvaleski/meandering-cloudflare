import { Env } from '../types';
import { uploadFileToR2 } from '../utils/r2Utils';

export async function handleCreateVoice(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const form = new FormData();
    form.append("clip", file);

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }));
    }

    await uploadFileToR2(file, env.USER_UPLOADED_CLIPS);
    const url = "https://api.cartesia.ai/voices/clone/clip";
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2024-06-10',
        'X-API-Key': env.CARTESIA_API_KEY.toString(),
      },
      body: form
    };

    const response = await fetch(url, options);
    const data = await response.text();

    return new Response(JSON.stringify(data), { status: response.status });
  } catch (err) {
    const error = err as Error;
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };

    return new Response(JSON.stringify({ error: 'An error occurred', details: errorDetails }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}