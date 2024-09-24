export function createSilentBuffer(sampleRate: number, durationInSeconds: number) {
    const numberOfSamples = sampleRate * durationInSeconds;
    return new Float32Array(numberOfSamples);
}