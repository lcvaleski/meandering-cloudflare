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
            throw new Error("Missing required parameters");
        }

        const textUri = `http://localhost:8787/${env.GENERATE_TEXT_SEGMENT_ROUTE}`;
        const audioUri = `http://localhost:8787/${env.GENERATE_AUDIO_SEGMENT_ROUTE}`;

        const audioGenerator = generateAudioStream(env, segments, voice, textUri, audioUri);

        // Collect all audio segments into a single buffer
        let audioBuffers: Uint8Array[] = [];
        for await (const audioChunk of audioGenerator) {
            audioBuffers.push(audioChunk);
        }

        // Combine the buffers into a single Uint8Array
        const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        for (const buffer of audioBuffers) {
            combinedAudio.set(buffer, offset);
            offset += buffer.length;
        }

        const r2ObjectKey = `stories/${story_type}-${Date.now()}.mp3`;

        // Upload the combined audio buffer to R2
        await env.USER_UPLOADED_CLIPS.put(r2ObjectKey, combinedAudio);

        return new Response(JSON.stringify({ message: `Audio story stored at ${r2ObjectKey}` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        const error = err as Error;
        console.error(err as Error);
        return new Response(JSON.stringify({ error: error.message || "An error occurred" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
