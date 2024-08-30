export async function uploadFileToR2(fullBuffer: Uint8Array, fileName: string, bucket: R2Bucket, contentType: string = 'audio/wav'): Promise<void> {
    try {
        const r2Object = await bucket.put(fileName, fullBuffer.buffer, {
            httpMetadata: { contentType },
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
}
