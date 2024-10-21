import { Env } from '../types';
import { convertToWav } from '../utils/convert-to-wav';
import { createSilentBuffer } from '../utils/create-silent-buffer';
import { generateAudioStream } from '../utils/generate-audio-stream';
import { streamFromAsyncGenerator } from '../utils/stream-from-async-generator';

export async function handleGenerateStory(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as { story_type: string, segments: number, voice: string };
        const { story_type, segments, voice } = requestBody;

        if (!story_type || !segments || !voice) {
            console.error("Missing required parameters: story_type, segments, or voice");
            return new Response(JSON.stringify({ error: "Missing required parameters: story_type, segments, or voice" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const textUri = new URL(env.GENERATE_TEXT_SEGMENT_ROUTE, request.url).toString();
        const audioUri = new URL(env.GENERATE_AUDIO_SEGMENT_ROUTE, request.url).toString();

        const audioGenerator = generateAudioStream(env, segments, voice, textUri, audioUri);

        let audioBuffers: Uint8Array[] = [];
        for await (const audioChunk of audioGenerator) {
            console.log("Received audio chunk of size:", audioChunk.length);
            audioBuffers.push(audioChunk);
        }

        const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        for (const buffer of audioBuffers) {
            combinedAudio.set(buffer, offset);
            offset += buffer.length;
        }

        console.log("Total combined audio size:", totalLength);

        const r2ObjectKey = `stories/${story_type}-${Date.now()}.mp3`;
        console.log("Uploading combined audio to R2 at key:", r2ObjectKey);

        await env.USER_UPLOADED_CLIPS.put(r2ObjectKey, combinedAudio);

        console.log(`Audio story successfully stored at ${r2ObjectKey}`);
        return new Response(JSON.stringify({ message: `Audio story stored at ${r2ObjectKey}` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error("Error generating audio story:", err);
        const error = err as Error;
        return new Response(JSON.stringify({ error: error.message || "An error occurred" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
