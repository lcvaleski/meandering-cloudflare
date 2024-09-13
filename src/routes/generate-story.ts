import { Env } from '../types';

export async function handleGenerateStory(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as { story_type : string, segments : number, voice : string };
        const story_type = requestBody.story_type ?? console.log("No story type present");
        const segments = requestBody.segments ?? console.log("No segments count present");
        const voice = requestBody.voice ?? console.log("No voice present");
        const textUri = 'http://localhost:8787/generate-text-segment';
        const audioUri = 'http://localhost:8787/generate-audio-segment';
        var i = 0;
        while (i < segments) {
            const textOptions = { 
                method: 'POST',
                body: JSON.stringify({ prompt : 'Say I am an M&M' }),
            };
            const textResponse = await fetch(textUri, textOptions);
            const content = await textResponse.text();
            const audioOptions = {
                method: 'POST',
                body: JSON.stringify({ transcript : "hello world", id : "a0e99841-438c-4a64-b679-ae501e7d6091" }),
            };
            const audioResponse = await fetch(audioUri, audioOptions);
            console.log(content);
            i += 1;
        };
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