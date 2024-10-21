export async function* generateAudioStream(env: Env, segments: number, voice: string, textUri: string, audioUri: string): AsyncGenerator<Uint8Array> {
    for (let i = 0; i < segments; i++) {
        // Generate text segment
        const textResponse = await fetch(textUri, {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Talk a bit about dogs. Two sentences, max.' }),
        });
        const content = await textResponse.text();
        console.log(content);

        // Generate audio segment
        const audioResponse = await fetch(audioUri, {
            method: 'POST',
            body: JSON.stringify({ transcript: content, id: voice }),
        });

        if (!audioResponse.ok) {
            throw new Error(`Failed to generate audio segment ${i}: ${audioResponse.statusText}`);
        }

        const audioBuffer = await audioResponse.arrayBuffer();

        yield new Uint8Array(audioBuffer);
    }
}
