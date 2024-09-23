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

        let i = 0;
        let masterBuffer = new Uint8Array();

        while (i < segments) {
            const textOptions = { 
                method: 'POST',
                body: JSON.stringify({ prompt : 'Talk a bit about dogs. Two sentences, max.' }),
            };
            const textResponse = await fetch(textUri, textOptions);
            const content = await textResponse.text();
            console.log(content);
            const audioOptions = {
                method: 'POST',
                body: JSON.stringify({ transcript : content, id : "a0e99841-438c-4a64-b679-ae501e7d6091" }),
            };
            const audioResponse = await fetch(audioUri, audioOptions);
            const newBuffer = await audioResponse.arrayBuffer();

            const combinedBuffer = new Uint8Array(masterBuffer.length + newBuffer.byteLength);
            combinedBuffer.set(masterBuffer, 0);
            combinedBuffer.set(new Uint8Array(newBuffer), masterBuffer.length);
            masterBuffer = combinedBuffer;
            i += 1;
        };

        const wavBuffer = convertToWav(masterBuffer);
        console.log(wavBuffer);
        const upload = await env.USER_UPLOADED_CLIPS.put('NEW.wav', wavBuffer);
        if (upload) {
            console.log("uploaded")
        }
        else {
            console.log("Not uploaded");
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

function convertToWav(audioBuffer: Uint8Array): ArrayBuffer {
    const numChannels = 1; // Mono
    const sampleRate = 44100; // Standard sample rate
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = audioBuffer.length;
    const bufferSize = 44 + dataSize;
  
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);
  
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
  
    // Write audio data
    for (let i = 0; i < dataSize; i++) {
      view.setUint8(44 + i, audioBuffer[i]);
    }
  
    return buffer;
  }

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }