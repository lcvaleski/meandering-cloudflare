import { Env } from '../types';

export async function handleGenerateStory(request: Request, env: Env): Promise<Response> {
    try {
        const requestBody = await request.json() as { story_type : string, segments : number, voice : string };

        const story_type = requestBody.story_type ?? console.log("No story type");
        if (!story_type) {
            throw new Error("No story type parameter")
        };

        const segments = requestBody.segments ?? console.log("No segments count");
        if (!segments) {
            throw new Error("No segments parameter")
        };

        const voice = requestBody.voice ?? console.log("No voice present");

        if (!voice) {
            throw new Error("No voice parameter");
        }
        const textUri = `http://localhost:8787/${ env.GENERATE_TEXT_SEGMENT_ROUTE }`;
        const audioUri = `http://localhost:8787/${ env.GENERATE_AUDIO_SEGMENT_ROUTE }`;
        var i = 0;
        while (i < segments) {
            const textOptions = { 
                method: 'POST',
                body: JSON.stringify({ prompt : 'Talk a bit about dogs' }),
            };
            const textResponse = await fetch(textUri, textOptions);
            const content = await textResponse.text();
            console.log(content);
            const audioOptions = {
                method: 'POST',
                body: JSON.stringify({ transcript : content, id : "a0e99841-438c-4a64-b679-ae501e7d6091" }),
            };
            const audioResponse = await fetch(audioUri, audioOptions);
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