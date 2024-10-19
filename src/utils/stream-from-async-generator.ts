export function streamFromAsyncGenerator(generator: AsyncGenerator<Uint8Array>): ReadableStream {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await generator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
        cancel() {
            generator.return(undefined);
        }
    });
}