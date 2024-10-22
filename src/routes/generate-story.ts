import { Env } from '../types';
import { createSilentBuffer } from '../utils/create-silent-buffer';
import { generateAudioSegments } from '../utils/generate-audio-segments';
import { handleSitchSegments } from '../utils/stitch-segments';

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

        // Keep these outside of the generateAudioSegments function because request.url depends on prod/dev
        const textUri = new URL(env.GENERATE_TEXT_SEGMENT_ROUTE, request.url).toString();
        const audioUri = new URL(env.GENERATE_AUDIO_SEGMENT_ROUTE, request.url).toString();

        const audioGenerator = generateAudioSegments(env, segments, voice, textUri, audioUri);

        let i = 1;
        for await (const audioChunk of audioGenerator) {
            const r2ObjectKey = `stories/${story_type}-${new Date().toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()}-${i}.mp3`;
            await env.USER_UPLOADED_CLIPS.put(r2ObjectKey, audioChunk);
            i++;
        }
        const finalizeStory = await handleSitchSegments();
        console.log(finalizeStory.statusText);

        return new Response(JSON.stringify({ message: `Audio story success` }), {
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
