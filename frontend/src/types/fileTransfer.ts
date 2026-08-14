export type TransferState =
  | 'IDLE'
  | 'SELECTING'
  | 'PREVIEWING'
  | 'REQUESTING'
  | 'REQUESTED'
  | 'CONNECTING'
  | 'TRANSFERRING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED';

export interface FileMetadata {
  transferId: string;
  name: string;
  size: number;
  type: string;
}

export interface TransferStats {
  speed: number; // in MB/s
  progress: number; // percentage (0 - 100)
  transferredBytes: number;
  remainingBytes: number;
  eta: number; // in seconds
  currentChunk: number;
  totalChunks: number;
}

export interface SignalingPayload {
  type: 'request' | 'accept' | 'reject' | 'offer' | 'answer' | 'candidate' | 'pause' | 'resume' | 'cancel' | 'error';
  transferId: string;
  metadata?: FileMetadata;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  lastAcknowledgedChunk?: number;
  error?: string;
}

export interface SignalingMessage {
  senderId: string;
  receiverId: string;
  signal: SignalingPayload;
}
