import { Env } from '../types';

interface RequestBody {
    transcript: string;
    id: string | number[];
}

export async function handleGenerateAudioSegment(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as RequestBody;

        const transcript = requestBody.transcript ?? console.log("No transcript present");

        let id = requestBody.id ?? console.log("No id/embedding present")

        if (typeof id === "string") {
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
                        id: id,
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
        }
        else if (typeof id === "object") {
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
                        embedding: id,
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
        }
        return new Response(null, {
            status: 417,
            statusText: "Something went wrong",
        })

    } catch (err) {
        console.error('Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}