export async function uploadFileToR2(file: File, bucket: R2Bucket): Promise<void> {
    try {
      const r2Object = await bucket.put(file.name, await file.arrayBuffer(), {
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
  }