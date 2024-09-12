import { Env } from '../types';

export async function handleGenerateStory(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as { story_type : string, segments : number, voice : string };
        const story_type = requestBody.story_type ?? console.log("No story type present");
        const segments = requestBody.segments ?? console.log("No segments count present");
        const voice = requestBody.voice ?? console.log("No voice present");
        return new Response(JSON.stringify(voice + story_type + segments));
    } catch (err) {
        console.error(err);
        const error = err as Error;
        const body = JSON.stringify({ error: error.message || "An error occured"});
        return new Response(body, {
            status: 500,
            headers: { 'Content-Type' : 'application/json'},
        })
    }
}