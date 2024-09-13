import { Env } from '../types';

interface RequestBody {
    transcript: string;
    id: string | number[]; // Allow 'id' to be either a string or number[]
}

export async function handleGenerateAudioSegment(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as RequestBody;

        const transcript = requestBody.transcript ?? console.log("No transcript present");

        let idAsNumberArray: number[] = [];

        if (typeof requestBody.id === 'string') {
            idAsNumberArray = requestBody.id.split('-').map(part => {
                return parseInt(part, 16);
            });
        } 
        else if (Array.isArray(requestBody.id) && requestBody.id.every(item => typeof item === 'number')) {
            idAsNumberArray = requestBody.id;
        } 
        else {
            console.error('Invalid id format');
            return new Response(JSON.stringify({ error: 'Invalid id format' }), { status: 400 });
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
                voice: {
                    mode: "embedding",
                    embedding: idAsNumberArray,  // Pass the number[] type
                    __experimental_controls: {
                        speed: "slow",
                    }
                },
                output_format: {
                    container: "wav",
                    encoding: "pcm_s16le",
                    sample_rate: 44100
                },
                language: "en"
            })
        };

        const response = await fetch('https://api.cartesia.ai/tts/bytes', options);
        const buffer = await response.arrayBuffer();

        const r2Object = await env.USER_UPLOADED_CLIPS.put('generated_sample_audio.wav', buffer);
        
        if (r2Object) {
            console.log("Uploaded file to R2");
        } else {
            console.error("Failed to upload file to R2");
            return new Response(JSON.stringify({ error: 'Failed to upload file to R2' }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: '/generate-sample audio file uploaded successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
