/**
 * Safe Blob reconstruction from accumulated ArrayBuffer chunks.
 * Performs checks on total chunks count, presence, and size match.
 */
export const mergeChunks = (
  chunks: ArrayBuffer[],
  totalChunks: number,
  expectedSize: number,
  mimeType: string
): Blob => {
  if (chunks.length !== totalChunks) {
    throw new Error(`Integrity check failed: Expected ${totalChunks} chunks, received ${chunks.length}.`);
  }

  // Check for any missing chunks (holes) in the array
  let actualSize = 0;
  for (let i = 0; i < totalChunks; i++) {
    if (!chunks[i]) {
      throw new Error(`Integrity check failed: Chunk at index ${i} is missing.`);
    }
    actualSize += chunks[i].byteLength;
  }

  if (actualSize !== expectedSize) {
    throw new Error(
      `Integrity check failed: Expected file size is ${expectedSize} bytes, but reconstructed file size is ${actualSize} bytes.`
    );
  }

  // Combine directly into a Blob. This is memory efficient because the browser
  // handles references to the array buffers directly without copying them in memory twice.
  return new Blob(chunks, { type: mimeType });
};
