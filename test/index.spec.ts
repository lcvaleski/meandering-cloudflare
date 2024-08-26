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
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(await response.status).toBe(404);
        expect(await response.text()).toBe("Not Found");
	});
});

describe('create-voice request worker', () => {
	it('responds with 401', async () => {
		const headers = new Headers({
          "Content-Type": "multipart/form-data; boundary=\"test\""
        });

	    const file = new File(["content"], "test.txt", { type: "text/plain" });

        // Create FormData and append the file
        const formData = new FormData();
        formData.append("file", file);

		const request = new IncomingRequest(
			'http://example.com/create-voice',
      {method: "POST",
      body: formData}
		);
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);

		// lacking an CARTESIA_API_KEY when running local tests, thus
		// an 401 (unauthorized) response is expected
		expect(await response.status).toBe(401);
	});
});
