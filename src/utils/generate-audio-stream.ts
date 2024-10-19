export async function* generateAudioStream(env: Env, segments: number, voice: string, textUri: string, audioUri: string): AsyncGenerator<Uint8Array> {
    for (let i = 0; i < segments; i++) {
        // Generate text segment
        const textResponse = await fetch(textUri, {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Talk a bit about dogs. Two sentences, max.' }),
        });
        const content = await textResponse.text();

        // Generate audio segment
        const audioResponse = await fetch(audioUri, {
            method: 'POST',
            body: JSON.stringify({ transcript: content, id: voice }),
        });

        if (!audioResponse.ok) {
            throw new Error(`Failed to generate audio segment ${i}`);
        }

        // Yield the audio data as Uint8Array
        const reader = audioResponse.body!.getReader();
        let result: ReadableStreamReadResult<Uint8Array>;
        while (!(result = await reader.read()).done) {
            yield result.value;
        }
    }
}
