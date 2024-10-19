import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';


const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Root', () => {
    it('Responds with 404 Not Found', async () => {
        const request = new IncomingRequest('http://example.com/');

        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);

        expect(await response.status).toBe(404);
        expect(await response.text()).toBe("Not Found");
    });
});

describe('Text segment generation', () => {
    it('Responds with 200', async () => {
        const request = new IncomingRequest(`http://example.com/${ env.GENERATE_TEXT_SEGMENT_ROUTE }`, {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Say something' }),
        });
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        expect(await response.status).toBe(200);
    });
});

describe('Create voice', () => {
    it('No file uploaded, responds with 400', async () => {
        const formData = new FormData();
        
        const request = new IncomingRequest(
            `http://example.com/${ env.CREATE_VOICE_ROUTE }`,
            {
                method: "POST",
                body: formData
            }
        );

        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);

        expect(await response.status).toBe(400);
        expect(await response.statusText).toBe("Bad request: No file uploaded");

    });

    // it('file uploaded, responds with 200', async () => {
    //     const formData = new FormData();
    //     const ctx = createExecutionContext();
    
    //     const getFileRequest = new IncomingRequest(
    //         'https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav',
    //         {
    //             method: "GET",
    //         }
    //     );
    
    //     await env.TESTS

    //     const fileResponse = await worker.fetch(getFileRequest, env, ctx);
    //     const buffer = await fileResponse.arrayBuffer();
    //     console.log(`File size fetched: ${buffer.byteLength} bytes`);
    //     const fileBlob = new Blob([buffer], { type: 'audio/wav' });
    //     formData.append("file", fileBlob, "CantinaBand60.wav");
    
    //     const request = new IncomingRequest(
    //         `http://example.com/${env.CREATE_VOICE_ROUTE}`,
    //         {
    //             method: "POST",
    //             body: formData
    //         }
    //     );
    
    //     const response = await worker.fetch(request, env, ctx);
    //     await waitOnExecutionContext(ctx);
    
    //     // Debugging logs
    //     console.log(`Response Status: ${response.status}`);
    //     if (response.status !== 200) {
    //         console.log(`Response Text: ${await response.text()}`);
    //     }
    
    //     expect(response.status).toBe(200);
    // });

});
