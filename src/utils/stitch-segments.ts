import { Env } from "../types";

export async function handleSitchSegments() {
    const lamdaUrl = "https://eeebanr3posj7hzd2xsoz74exa0hybit.lambda-url.us-east-2.on.aws/"

    const params = {
        bucketName: 'user-uploaded-clips',
        parts: ["CantinaBand60_1.wav", "CantinaBand60_2.wav"],
        finalKey: 'BIG_CANTINA.wav',
    }

    try {
        const response = await fetch(lamdaUrl, {
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    
        const result = await response.json()
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type' : 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to call Lambda function" }), {
            headers: { 'Content-Type' : 'application/json' }
        });
    }
    
}