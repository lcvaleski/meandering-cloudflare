export function convertToWav(audioBuffer: Uint8Array): ArrayBuffer {
    const numChannels = 1; // Mono
    const sampleRate = 44100; // Standard sample rate
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = audioBuffer.length;
    const bufferSize = 44 + dataSize;
  
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);
  
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
  
    // Write audio data
    for (let i = 0; i < dataSize; i++) {
      view.setUint8(44 + i, audioBuffer[i]);
    }
  
    return buffer;
  }

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }