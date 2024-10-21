import { Env } from '../types';

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export async function handleGenerateTextSegment(request: Request, env: Env): Promise<Response> {
    try {
        // Parse the request body and log request details
        const requestBody = await request.json() as { prompt: string };
        const prompt = requestBody.prompt;

        if (!prompt) {
            console.error("Prompt is missing in the request body");
            return new Response(JSON.stringify({ error: "No prompt present in the request body" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log("Received prompt:", prompt);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENAI_API_KEY.toString()}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ "role": "user", "content": prompt }],
                temperature: 0.7,
            }),
        };

        console.log("Sending request to OpenAI API with options:", options);

        const response = await fetch('https://api.openai.com/v1/chat/completions', options);

        console.log("OpenAI API response status:", response.status);
        console.log("OpenAI API response headers:", response.headers);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenAI API responded with an error:", errorBody);
            return new Response(JSON.stringify({ error: `OpenAI API error: ${response.statusText}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const completion = await response.json() as OpenAIResponse;
        const content = completion.choices[0]?.message.content;

        if (!content) {
            console.error("No content in OpenAI response");
            return new Response(JSON.stringify({ error: "No content in OpenAI response" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log("Generated content:", content);

        return new Response(JSON.stringify({ content }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error("Error during request processing:", err);
        const error = err as Error;
        const body = JSON.stringify({ error: error.message || "An unexpected error occurred" });
        return new Response(body, {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
