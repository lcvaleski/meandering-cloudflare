// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';


// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('root request worker', () => {
    it('responds with Not Found', async () => {
        const request = new IncomingRequest('http://example.com/');
        // Create an empty context to pass to `worker.fetch()`∏
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(await response.status).toBe(404);
        expect(await response.text()).toBe("Not Found");
    });
});

describe('create-voice request worker', () => {
    it('no file uploaded, responds with 400', async () => {
        const formData = new FormData();
        
        const request = new IncomingRequest(
            `http://example.com/${ env.CREATE_VOICE_ROUTE }`,
            {
                method: "POST",
                body: formData}
            );

        // Create an empty context to pass to `worker.fetch()`.
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);

        expect(await response.status).toBe(400);
        expect(await response.statusText).toBe("Bad request: No file uploaded");

    });

    //
    // ***** Work in progress test
    // ***** How do we mock a file? Having difficulty with this.
    //

    // it('file uploaded, responds with 200', async () => {
    //     const formData = new FormData();
    //     const ctx = createExecutionContext();

    //     const getFileRequest = new IncomingRequest(
    //         'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
    //         {
    //             method: "GET",
    //         }
    //     )
        
    //     const fileResponse = await worker.fetch(getFileRequest, env, ctx);
    //     const buffer = await fileResponse.arrayBuffer(); 
    //     const fileBlob = new Blob([buffer], { type: 'audio/wav' });
    //     formData.append("file", fileBlob, "CantinaBand60.wav");

    //     const request = new IncomingRequest(
    //         'http://example.com/${ env.CREATE_VOICE_ROUTE }',
    //         {
    //             method: "POST",
    //             body: formData}
    //         );

    //     // Create an empty context to pass to `worker.fetch()`.
    //     const response = await worker.fetch(request, env, ctx);
    //     // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    //     await waitOnExecutionContext(ctx);

    //     expect(await response.status).toBe(200);

    // });

});
