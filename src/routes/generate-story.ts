import { Env } from '../types';
import { convertToWav } from '../utils/convert-to-wav';
import { createSilentBuffer } from '../utils/create-silent-buffer';

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

        let i = 0;
        let masterBuffer = new Uint8Array();


        const sampleRate = 44100;
        const silenceDuration = 0.5;
        const silentBuffer = createSilentBuffer(sampleRate, silenceDuration);
        while (i < segments) {
            const textOptions = { 
                method: 'POST',
                body: JSON.stringify({ prompt : 'Talk a bit about dogs. Two sentences, max.' }),
            };
            const textResponse = await fetch(textUri, textOptions);
            const content = await textResponse.text();
            const audioOptions = {
                method: 'POST',
                body: JSON.stringify({ transcript : content, id : "a0e99841-438c-4a64-b679-ae501e7d6091" }),
            };
            const audioResponse = await fetch(audioUri, audioOptions);
            const newBuffer = await audioResponse.arrayBuffer();

            const combinedBuffer = new Uint8Array(masterBuffer.length + newBuffer.byteLength + silentBuffer.byteLength);
            combinedBuffer.set(masterBuffer, 0);
            combinedBuffer.set(new Uint8Array(newBuffer), masterBuffer.length);
            combinedBuffer.set(new Uint8Array(silentBuffer.buffer), masterBuffer.length + newBuffer.byteLength);
            masterBuffer = combinedBuffer;
            i += 1;
        };

        const wavBuffer = convertToWav(masterBuffer);
        const upload = await env.USER_UPLOADED_CLIPS.put('NEW.wav', wavBuffer);
        if (upload) {
            console.log("Uploaded to R2")
        }
        else {
            console.log("Not-uploaded to R2");
        }
        return new Response(wavBuffer, {
            headers: {
                'Content-Type' : 'audio/wav',
            },
        });

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