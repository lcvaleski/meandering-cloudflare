interface Env {
	MEANDERING: R2Bucket;
	CARTESIA_API_KEY: String;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {

	//
	// /upload-sample
	// Upload the user's sample audio to R2.
	//

    if (request.method === 'POST' && new URL(request.url).pathname === '/upload-sample') {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return new Response('No file uploaded', { status: 400 })
      }

      const r2Object = await env.MEANDERING.put(file.name, await file.arrayBuffer(), {
        httpMetadata: file.type ? { contentType: file.type } : undefined,
      })

      return new Response(JSON.stringify({ success: true, key: r2Object.key }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

	//
	// /create-voice
	// Stable for Cartesia version 2024-06-10. 
	// https://docs.cartesia.ai/api-reference/endpoints/clone-voice-clip
	// 

	if (request.method === 'POST' && new URL(request.url).pathname === '/create-voice') {
		try {
			const formData = await request.formData();
			const file = formData.get('file') as File;
			const form = new FormData();
			form.append("clip", file);

			if (!file) {
				return new Response(JSON.stringify({ error: "No file uploaded"}));
			}


			//
			// Upload the sample to R2 to have for future reference.
			// 

			try {
				const r2Object = await env.MEANDERING.put(file.name, await file.arrayBuffer(), {
				  httpMetadata: file.type ? { contentType: file.type } : undefined,
				});
			  
				if (r2Object) {
				  console.log("File uploaded successfully to R2");
				} else {
				  console.error("Upload to R2 failed: Unexpected null response");
				}
			  } catch (error: unknown) {
				if (error instanceof Error) {
				  console.error("Error uploading to R2:", error.message);
				} else {
				  console.error("An unknown error occurred while uploading to R2");
				}
			  }

			// 
			// Use Cartesia's API to clone the voice. Returns an embedding. 
			//

			const url = "https://api.cartesia.ai/voices/clone/clip";
	
			const options: RequestInit = {
				method: 'POST',
				headers: {
					'Cartesia-Version': '2024-06-10',
					'X-API-Key': env.CARTESIA_API_KEY.toString(),
				},
				body: form
			};
	
			const response = await fetch(url, options);
			let data;
			data = await response.text(); 

			return new Response(JSON.stringify(data), { status: response.status });

		} catch (err) {
			const error = err as Error
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
	


    return new Response('Not Found', { status: 404 })
  }
}