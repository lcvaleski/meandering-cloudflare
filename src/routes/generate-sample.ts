import { Env } from '../types';
import { uploadFileToR2 } from '../utils/r2Utils';


//
// Currently /generate-sample only uploads the raw audio (.pcm) to R2.
// Although I am verifying they are uploading, I don't see them on the user-uploaded-clips bucket page.
// This is also currently not using the embedding returned by /create-voice. This should later be a paramter. 
// I think that I will make this something like /generate-audio with another parameter for the transcript. 
// That way I can make it more multi-purpose. 
// When /create-voice is used, in the same stroke we can plug the returni nto this /generate-audio with a small transcript, 
// which will be uploaded into R2.
// Remember that this is important bedrock and shouldn't be rushed through. 
// 

export async function handleGenerateSample(request: Request, env: Env): Promise<Response> {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Cartesia-Version': '2024-06-10',
                'X-API-Key': env.CARTESIA_API_KEY.toString(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_id: "sonic-english",
                transcript: "Hello, world! I'm generating audio on Cartesia.",
                duration: 123,
                voice: {
                    mode: "id",
                    id: "a0e99841-438c-4a64-b679-ae501e7d6091",
                    __experimental_controls: {
                        speed: "normal",
                        emotion: ["positivity:high", "curiosity"]
                    }
                },
                output_format: {
                    container: "wav",
                    encoding: "pcm_s16le",
                    sample_rate: 8000
                },
                language: "en"
            })
        };
        
        const response = await fetch('https://api.cartesia.ai/tts/bytes', options);

        if (!response.ok) {
            throw new Error(`Cartesia API responded with status ${response.status}`);
        }

        //
        // Here we read the chunks of the byte stream
        // Then use uploadtoR2 utility. 
        //

        const buffer = await response.arrayBuffer();
        const r2Object = await env.USER_UPLOADED_CLIPS.put('generated_sample_audio.wav', buffer, {
            httpMetadata: { contentType: 'audio/wav' },
        });

        if (r2Object) {
            console.log("uploaded");
        }
        console.log(r2Object);

        return new Response(JSON.stringify({ 
            message: 'Audio file generated and uploaded successfully',
        }), {       
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (err) {
        const error = err as Error;
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };

        return new Response(JSON.stringify({ error: 'An error occurred', details: errorDetails }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
