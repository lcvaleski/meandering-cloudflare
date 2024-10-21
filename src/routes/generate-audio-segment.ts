import { Env } from '../types';

interface RequestBody {
    transcript: string;
    id: string | number[];
}

export async function handleGenerateAudioSegment(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as RequestBody;

        const transcript = requestBody.transcript;
        if (!transcript) {
            console.error("Transcript is missing in the request body");
            return new Response(JSON.stringify({ error: "No transcript present in the request body" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let id = requestBody.id;
        if (!id) {
            console.error("ID/embedding is missing in the request body");
            return new Response(JSON.stringify({ error: "No id/embedding present in the request body" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log("Transcript:", transcript);
        console.log("ID/embedding:", id);

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
                    mode: typeof id === "string" ? "id" : "embedding",
                    [typeof id === "string" ? "id" : "embedding"]: id,
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

        console.log("Sending request to Cartesia API with options:", options);

        const response = await fetch('https://api.cartesia.ai/tts/bytes', options);

        console.log("Cartesia API response status:", response.status);
        console.log("Cartesia API response headers:", response.headers);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Cartesia API responded with an error:", errorBody);
            throw new Error(`Cartesia API error: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        console.log("Audio buffer received successfully");
        return new Response(buffer, {
            status: 200,
            headers: { 'Content-Type': 'application/octet-stream' }
        });

    } catch (err) {
        console.error("Error during request processing:", err);
        const error = err as Error;
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
