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
        const requestBody = await request.json() as { prompt: string };
        const prompt = requestBody.prompt ?? console.log("No prompt present");
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENAI_API_KEY.toString()}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{"role": "user", "content": `${ prompt }`}],
                temperature: 0.7
            })
        };
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);;
        const completion = await response.json() as OpenAIResponse;
        const content = completion.choices[0]?.message.content;
        return new Response(JSON.stringify(content), {
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (err) {
        console.error(err);
        const error = err as Error;
        const body = JSON.stringify({ error: error.message || "An error occurred" });
        return new Response(body, {
            status: 500,
            headers: { 'Content-Type' : 'application/json' },
        });
    }
}