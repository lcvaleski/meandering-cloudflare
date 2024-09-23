import { Env } from '../types';

interface RequestBody {
    transcript: string;
    id: string | number[];
}

// curl -X POST https://api.cartesia.ai/tts/bytes \
//      -H "Cartesia-Version: string" \
//      -H "X-API-Key: <apiKey>" \
//      -H "Content-Type: application/json" \
//      -d '{
//   "model_id": "string",
//   "transcript": "string",
//   "voice": {
//     "mode": "id"
//   },
//   "output_format": {
//     "container": "raw",
//     "encoding": "pcm_s16le",
//     "sample_rate": 0
//   }
// }'

export async function handleGenerateAudioSegment(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as RequestBody;

        const transcript = requestBody.transcript ?? console.log("No transcript present");

        let idAsNumberArray: number[] = [];

        // if (typeof requestBody.id === 'string') {
        //     idAsNumberArray = requestBody.id.split('-').map(part => {
        //         return parseInt(part, 16);
        //     });
        // } 
        // else if (Array.isArray(requestBody.id) && requestBody.id.every(item => typeof item === 'number')) {
        //     idAsNumberArray = requestBody.id;
        // } 
        // else {
        //     console.error('Invalid id format');
        //     return new Response(JSON.stringify({ error: 'Invalid id format' }), { status: 400 });
        // }

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
                    mode: "id",
                    id: "a0e99841-438c-4a64-b679-ae501e7d6091",
                    __experimental_controls: {
                        speed: "slow",
                    }
                },
                output_format: {
                    container: "raw",
                    encoding: "pcm_s16le",
                    sample_rate: 44100
                },
                language: "en"
            })
        };

        const response = await fetch('https://api.cartesia.ai/tts/bytes', options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        return new Response(buffer, {
            status: 200,
        });

    } catch (err) {
        console.error('Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
