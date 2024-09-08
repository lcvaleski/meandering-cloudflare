import { Env } from '../types';

export async function handleGenerateSample(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as { transcript: string; id: number[]};
        const transcript = requestBody.transcript ?? console.log("No transcript present");
        const id = requestBody.id ?? console.log("No voice id present");

        if(!requestBody) {
            return new Response(JSON.stringify({details: `No transcript present`}), {
                status: 400,
                statusText: "Bad request",
                headers: { 'Content-Type': 'application/json'}
                });
        }

        if(!id) {
            return new Response(JSON.stringify({details: `No id present`}), {
                status: 400,
                statusText: "Bad request",
                headers: { 'Content-Type': 'application/json'}
                });
        }

        const options = {
            method: 'POST',
            headers: {
                'Cartesia-Version': '2024-06-10',
                'X-API-Key': env.CARTESIA_API_KEY.toString(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_id: "sonic-english",
                transcript: transcript,
                duration: 123,
                voice: {
                    mode: "embedding",
                    embedding: id,
                    __experimental_controls: {
                        speed: "slow",
                    }
                },
                output_format: {
                    container: "wav",
                    encoding: "pcm_s16le",
                    sample_rate: 8000
                },
                language: "en"
            })
        };
        
        const response = await fetch('https://api.cartesia.ai/tts/bytes', options);

        if (!response.ok) {
            console.log(`Cartesia API responded with status ${response.status}, ${response.statusText}`);
            return new Response(JSON.stringify({details: `Cartesia API responded with status ${response.status}, ${response.statusText}`}), {
                status: 400,
                statusText: "Bad reques: Cartesia error",
                headers: { 'Content-Type': 'application/json'}
                });
        }
        
        const buffer = await response.arrayBuffer();
        const r2Object = await env.USER_UPLOADED_CLIPS.put('generated_sample_audio.wav', buffer);

        if (r2Object) {
            console.log("Uploaded file to R2");
        }
        else {
            console.log("Failed to upload file to R2");
            return new Response(JSON.stringify({details: "Failed to upload file to R2"}), {
                status: 400,
                statusText: "Bad request: Failed to upload file to R2",
                headers: { 'Content-Type': 'application/json'}
                });
        }
        return new Response(JSON.stringify({ 
            message: '/generate-sample audio file uploaded successfully',
        }), {       
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
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
