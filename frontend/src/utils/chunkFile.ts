/**
 * Computes standard CRC32 checksum for an ArrayBuffer.
 */
export const crc32 = (buffer: ArrayBuffer): number => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0 ^ -1;
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ view[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
};

/**
 * Slices a chunk of data from a File object and reads it as an ArrayBuffer.
 * This is memory efficient because it does not load the entire file into memory.
 */
export const readChunk = (
  file: File,
  chunkIndex: number,
  chunkSize: number
): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blobSlice = file.slice(start, end);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result instanceof ArrayBuffer) {
        resolve(event.target.result);
      } else {
        reject(new Error("Failed to read chunk as ArrayBuffer"));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error("FileReader error"));
    };
    reader.readAsArrayBuffer(blobSlice);
  });
};
