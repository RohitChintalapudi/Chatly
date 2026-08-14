/**
 * WebRTC P2P Transfer Protocol Serializer/Deserializer
 * 
 * Packet structure:
 * - Text (String): JSON control frames (ACK, PAUSE, RESUME, CANCEL, COMPLETE)
 * - Binary (ArrayBuffer): File chunk frames with 48-byte header:
 *   - [0-3]    chunkIndex (Uint32)
 *   - [4-7]    totalChunks (Uint32)
 *   - [8-11]   checksum (Uint32, CRC32 of payload)
 *   - [12-47]  transferId (36 bytes string, UUIDv4)
 *   - [48+]    payload (raw file bytes)
 */

export interface ChunkPacket {
  chunkIndex: number;
  totalChunks: number;
  checksum: number;
  transferId: string;
  payload: ArrayBuffer;
}

export interface ControlPacket {
  type: 'ACK' | 'PAUSE' | 'RESUME' | 'CANCEL' | 'COMPLETE' | 'ERROR';
  transferId: string;
  chunkIndex?: number;
  error?: string;
}

const HEADER_SIZE = 48;
const TRANSFER_ID_SIZE = 36;

/**
 * Encodes a file chunk and its metadata header into a single ArrayBuffer.
 */
export const encodeChunkPacket = (
  transferId: string,
  chunkIndex: number,
  totalChunks: number,
  checksum: number,
  payload: ArrayBuffer
): ArrayBuffer => {
  const packetBuffer = new ArrayBuffer(HEADER_SIZE + payload.byteLength);
  const dataView = new DataView(packetBuffer);
  const uint8View = new Uint8Array(packetBuffer);

  // 1. Write numbers (Big-Endian)
  dataView.setUint32(0, chunkIndex, false);
  dataView.setUint32(4, totalChunks, false);
  dataView.setUint32(8, checksum, false);

  // 2. Write transferId (36 bytes UUID)
  const encoder = new TextEncoder();
  const idBytes = encoder.encode(transferId.slice(0, TRANSFER_ID_SIZE));
  
  // Copy transferId bytes
  for (let i = 0; i < TRANSFER_ID_SIZE; i++) {
    if (i < idBytes.length) {
      uint8View[12 + i] = idBytes[i];
    } else {
      uint8View[12 + i] = 0; // Pad with zeroes
    }
  }

  // 3. Write payload raw bytes
  const payloadView = new Uint8Array(payload);
  uint8View.set(payloadView, HEADER_SIZE);

  return packetBuffer;
};

/**
 * Decodes metadata header and returns the chunk packet.
 */
export const decodeChunkPacket = (buffer: ArrayBuffer): ChunkPacket => {
  if (buffer.byteLength < HEADER_SIZE) {
    throw new Error(`Packet is too small. Expected at least ${HEADER_SIZE} bytes.`);
  }

  const dataView = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  // 1. Read numbers
  const chunkIndex = dataView.getUint32(0, false);
  const totalChunks = dataView.getUint32(4, false);
  const checksum = dataView.getUint32(8, false);

  // 2. Read transferId
  const decoder = new TextDecoder();
  const idBytes = uint8View.subarray(12, 12 + TRANSFER_ID_SIZE);
  // Trim padding zero bytes if any
  let firstZeroIndex = idBytes.indexOf(0);
  const cleanIdBytes = firstZeroIndex !== -1 ? idBytes.subarray(0, firstZeroIndex) : idBytes;
  const transferId = decoder.decode(cleanIdBytes);

  // 3. Read payload
  const payload = buffer.slice(HEADER_SIZE);

  return {
    chunkIndex,
    totalChunks,
    checksum,
    transferId,
    payload,
  };
};

/**
 * Encodes a control frame as JSON string.
 */
export const encodeControlMessage = (
  type: ControlPacket['type'],
  transferId: string,
  extra: Partial<Omit<ControlPacket, 'type' | 'transferId'>> = {}
): string => {
  return JSON.stringify({
    type,
    transferId,
    ...extra,
  });
};

/**
 * Decodes a control frame from JSON.
 */
export const decodeControlMessage = (text: string): ControlPacket => {
  const data = JSON.parse(text);
  if (!data.type || !data.transferId) {
    throw new Error("Invalid control packet: Missing type or transferId.");
  }
  return data as ControlPacket;
};
