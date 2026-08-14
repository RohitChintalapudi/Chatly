import { create } from "zustand";
import { useAuthStore } from "../store/useAuthStore";
import { TransferState, FileMetadata, TransferStats, SignalingPayload } from "../types/fileTransfer";
import { validateFile, sanitizeFilename } from "../utils/fileValidators";
import { SpeedCalculator } from "../utils/speedCalculator";
import { calculateETA } from "../utils/etaCalculator";
import { readChunk, crc32 } from "../utils/chunkFile";
import { mergeChunks } from "../utils/mergeChunks";
import { WebRTCManager } from "./useDataChannel";
import {
  encodeChunkPacket,
  decodeChunkPacket,
  encodeControlMessage,
  decodeControlMessage,
  ControlPacket,
} from "../utils/protocol";
import toast from "react-hot-toast";

// Constants
const CHUNK_SIZE = 64 * 1024; // 64KB

// WebRTC Manager instance (module-level singleton to prevent React lifecycle resets)
const webRTC = new WebRTCManager();
const speedCalc = new SpeedCalculator();

// Transfer state variables (non-reactive for maximum performance and no render lag)
let currentChunkIndex = 0;
let totalChunksCount = 0;
let lastStateUpdate = 0;
let isWaitingForBuffer = false;
let receivedChunks: ArrayBuffer[] = [];
let lastAcknowledgedChunkIndex = -1;
let reconnectTimer: NodeJS.Timeout | null = null;
let socketSignalUnsubscribe: (() => void) | null = null;

interface FileTransferStore {
  transferId: string | null;
  role: "sender" | "receiver" | null;
  status: TransferState;
  file: File | null;
  metadata: FileMetadata | null;
  peerId: string | null;
  peerName: string | null;
  peerAvatar: string | null;
  error: string | null;
  stats: TransferStats | null;
  downloadUrl: string | null;

  // Actions
  initializeSocketListeners: () => void;
  selectFile: (file: File, peerId: string, peerName: string, peerAvatar: string) => void;
  selectFileForCode: (file: File) => void;
  clearSelection: () => void;
  sendTransferRequest: () => void;
  acceptRequest: () => void;
  declineRequest: () => void;
  pauseTransfer: () => void;
  resumeTransfer: () => void;
  cancelTransfer: () => void;
  resetTransfer: () => void;
  handleIncomingSignal: (senderId: string, signal: SignalingPayload) => void;
}

export const useFileTransferStore = create<FileTransferStore>((set, get) => {
  
  /**
   * Safe helper to send control messages via the DataChannel.
   */
  const sendControlMessage = (type: ControlPacket["type"], extra: object = {}) => {
    const { transferId } = get();
    if (!transferId) return;
    const msgStr = encodeControlMessage(type, transferId, extra);
    webRTC.sendData(msgStr);
  };

  /**
   * Internal sender loop to transmit file chunks.
   * Runs as fast as the network allows using buffer-level flow control.
   */
  const sendNextChunks = async () => {
    const { status, file, transferId } = get();
    if (status !== "TRANSFERRING" || !file || !transferId) return;

    while (currentChunkIndex < totalChunksCount) {
      // Flow control: if buffer is full (> 256KB), pause and wait for onbufferedamountlow
      if (webRTC.channel && webRTC.channel.bufferedAmount > 256 * 1024) {
        isWaitingForBuffer = true;
        break;
      }

      try {
        const chunkIndex = currentChunkIndex;
        const chunkBuffer = await readChunk(file, chunkIndex, CHUNK_SIZE);
        const checksum = crc32(chunkBuffer);
        const packet = encodeChunkPacket(transferId, chunkIndex, totalChunksCount, checksum, chunkBuffer);

        const sent = webRTC.sendData(packet);
        if (!sent) {
          console.warn("DataChannel send failed, pausing loop.");
          break;
        }

        currentChunkIndex++;
        const transferred = Math.min(currentChunkIndex * CHUNK_SIZE, file.size);
        const currentSpeed = speedCalc.update(transferred);
        const eta = calculateETA(file.size - transferred, currentSpeed);

        // Throttle React state updates to 150ms to prevent lag/flickering
        const now = performance.now();
        if (now - lastStateUpdate > 150 || currentChunkIndex === totalChunksCount) {
          set({
            stats: {
              speed: currentSpeed,
              progress: Math.floor((transferred / file.size) * 100),
              transferredBytes: transferred,
              remainingBytes: file.size - transferred,
              eta,
              currentChunk: currentChunkIndex,
              totalChunks: totalChunksCount,
            },
          });
          lastStateUpdate = now;
        }
      } catch (err) {
        console.error("Sender error in chunk sending loop:", err);
        set({ status: "FAILED", error: (err as Error).message });
        sendControlMessage("ERROR", { error: (err as Error).message });
        return;
      }
    }

    if (currentChunkIndex >= totalChunksCount) {
      console.log("Sender: All chunks transmitted. Awaiting completion...");
    }
  };

  /**
   * Handles incoming binary WebRTC data channel packets (receiver logic).
   */
  const handleBinaryMessage = (buffer: ArrayBuffer) => {
    const { status, metadata, transferId } = get();
    if (status !== "TRANSFERRING" || !metadata || !transferId) return;

    try {
      const packet = decodeChunkPacket(buffer);
      if (packet.transferId !== transferId) return;

      // Verify CRC32 Integrity
      const computedCrc = crc32(packet.payload);
      if (computedCrc !== packet.checksum) {
        throw new Error(`CRC32 check failed at chunk ${packet.chunkIndex}. Block corrupted.`);
      }

      // Write chunk to receiver buffer
      receivedChunks[packet.chunkIndex] = packet.payload;

      const transferred = receivedChunks.reduce((acc, chunk) => acc + (chunk ? chunk.byteLength : 0), 0);
      const currentSpeed = speedCalc.update(transferred);
      const eta = calculateETA(metadata.size - transferred, currentSpeed);

      const now = performance.now();
      if (now - lastStateUpdate > 150 || packet.chunkIndex === packet.totalChunks - 1) {
        set({
          stats: {
            speed: currentSpeed,
            progress: Math.floor((transferred / metadata.size) * 100),
            transferredBytes: transferred,
            remainingBytes: metadata.size - transferred,
            eta,
            currentChunk: packet.chunkIndex + 1,
            totalChunks: packet.totalChunks,
          },
        });
        lastStateUpdate = now;
      }

      // Periodically acknowledge every 32 chunks or at the end to keep sender informed
      if (packet.chunkIndex % 32 === 31 || packet.chunkIndex === packet.totalChunks - 1) {
        sendControlMessage("ACK", { chunkIndex: packet.chunkIndex });
      }

      // Check if all chunks received
      const totalReceived = receivedChunks.filter(Boolean).length;
      if (totalReceived === packet.totalChunks) {
        console.log("Receiver: All chunks received. Reconstructing file...");
        
        const blob = mergeChunks(receivedChunks, packet.totalChunks, metadata.size, metadata.type);
        const url = URL.createObjectURL(blob);

        set({
          status: "COMPLETED",
          downloadUrl: url,
        });

        // Notify sender we completed the assembly
        sendControlMessage("COMPLETE");
        toast.success("File transfer completed successfully!");
      }
    } catch (err) {
      console.error("Receiver binary process error:", err);
      set({ status: "FAILED", error: (err as Error).message });
      sendControlMessage("ERROR", { error: (err as Error).message });
    }
  };

  /**
   * Handles incoming text WebRTC control frames (both sides).
   */
  const handleControlMessage = (text: string) => {
    const { role, transferId } = get();
    if (!transferId) return;

    try {
      const packet = decodeControlMessage(text);
      if (packet.transferId !== transferId) return;

      console.log(`Control frame received: [${packet.type}]`, packet);

      switch (packet.type) {
        case "ACK":
          if (role === "sender") {
            lastAcknowledgedChunkIndex = packet.chunkIndex ?? lastAcknowledgedChunkIndex;
          }
          break;

        case "PAUSE":
          set({ status: "PAUSED" });
          toast.loading("Transfer paused by peer", { id: "transfer-status" });
          break;

        case "RESUME":
          set({ status: "TRANSFERRING" });
          toast.success("Transfer resumed", { id: "transfer-status" });
          if (role === "sender") {
            // Resume from last successfully saved chunk
            if (packet.chunkIndex !== undefined) {
              currentChunkIndex = packet.chunkIndex + 1;
            }
            sendNextChunks();
          }
          break;

        case "CANCEL":
          set({ status: "IDLE", transferId: null, role: null, stats: null });
          webRTC.closeConnection();
          toast.error("File sharing cancelled by peer");
          break;

        case "COMPLETE":
          if (role === "sender") {
            set({ status: "COMPLETED" });
            toast.success("File sent successfully!");
          }
          break;

        case "ERROR":
          set({ status: "FAILED", error: packet.error || "Remote connection error" });
          toast.error(`Transfer error: ${packet.error || "unknown"}`);
          break;
      }
    } catch (e) {
      console.error("Failed to parse control message", e);
    }
  };

  /**
   * Initiates WebRTC negotiation reconnect loops on network drop.
   */
  const handleConnectionRecovery = () => {
    const { status, role, peerId, transferId } = get();
    if (status !== "TRANSFERRING" && status !== "PAUSED") return;

    console.log("Connection Recovery: Link down. Pausing and waiting for auto-reconnect...");
    set({ status: "PAUSED" });
    toast.loading("Connection lost. Reconnecting...", { id: "transfer-status" });

    // Only sender (caller) initiates the connection rebuild
    if (role === "sender" && peerId && transferId) {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      
      const attemptReconnect = () => {
        const currentStatus = get().status;
        if (currentStatus !== "PAUSED") return;

        console.log("Connection Recovery: Attempting WebRTC reconnect offer...");
        webRTC.startConnection(peerId, transferId, rtcCallbacks);

        // Retry in 4 seconds if still disconnected
        reconnectTimer = setTimeout(attemptReconnect, 4000);
      };

      reconnectTimer = setTimeout(attemptReconnect, 2000);
    }
  };

  /**
   * Low-level WebRTCManager Event Callbacks
   */
  const rtcCallbacks = {
    onConnectionStateChange: (state: RTCIceConnectionState) => {
      if (state === "failed" || state === "disconnected") {
        handleConnectionRecovery();
      } else if (state === "connected") {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        console.log("Connection Recovery: WebRTC connected successfully!");
      }
    },
    
    onChannelStateChange: (state: RTCDataChannelState) => {
      const { role, transferId, status } = get();
      console.log(`Connection Recovery: DataChannel status is [${state}]`);

      if (state === "open") {
        if (status === "CONNECTING") {
          // Transition to active transferring
          set({ status: "TRANSFERRING" });
          toast.success("Connection established! Starting transfer...", { id: "transfer-status" });

          if (role === "sender") {
            sendNextChunks();
          }
        } else if (status === "PAUSED") {
          // Reconnection successful! Resume from last saved index
          set({ status: "TRANSFERRING" });
          toast.success("Connection recovered! Resuming...", { id: "transfer-status" });

          if (role === "receiver") {
            // Find highest contiguous received chunk index
            let lastContiguous = -1;
            for (let i = 0; i < totalChunksCount; i++) {
              if (receivedChunks[i] !== undefined) {
                lastContiguous = i;
              } else {
                break;
              }
            }
            sendControlMessage("RESUME", { chunkIndex: lastContiguous });
          }
        }
      }
    },

    onMessageReceived: (data: string | ArrayBuffer) => {
      if (typeof data === "string") {
        handleControlMessage(data);
      } else {
        handleBinaryMessage(data);
      }
    },

    onBufferedAmountLow: () => {
      if (isWaitingForBuffer) {
        isWaitingForBuffer = false;
        sendNextChunks();
      }
    },

    onError: (error: Error) => {
      console.error("WebRTC Engine Error:", error);
      set({ status: "FAILED", error: error.message });
      sendControlMessage("ERROR", { error: error.message });
    },
  };

  return {
    transferId: null,
    role: null,
    status: "IDLE",
    file: null,
    metadata: null,
    peerId: null,
    peerName: null,
    peerAvatar: null,
    error: null,
    stats: null,
    downloadUrl: null,

    /**
     * Set up listeners for file transfer signaling via WebSockets
     */
    initializeSocketListeners: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;

      if (socketSignalUnsubscribe) {
        socketSignalUnsubscribe();
      }

      const signalHandler = ({ senderId, signal }: { senderId: string; signal: SignalingPayload }) => {
        get().handleIncomingSignal(senderId, signal);
      };

      const matchedHandler = ({ receiverId }: { receiverId: string }) => {
        const { file, transferId } = get();
        if (!file || !transferId) return;

        const users = useChatStore.getState().users;
        const receiverInfo = users.find((u: any) => u._id === receiverId);

        set({
          peerId: receiverId,
          peerName: receiverInfo?.fullName || receiverInfo?.name || "Receiver",
          peerAvatar: receiverInfo?.profilePic || "/avatar.png",
          status: "CONNECTING",
        });

        toast.success("Receiver matched code! Connecting WebRTC link...", { id: "p2p-status" });
        webRTC.startConnection(receiverId, transferId, rtcCallbacks);
      };

      const resolvedHandler = ({
        senderId,
        transferId: incomingTransferId,
        metadata: incomingMetadata,
      }: {
        senderId: string;
        transferId: string;
        metadata: FileMetadata;
      }) => {
        const users = useChatStore.getState().users;
        const senderInfo = users.find((u: any) => u._id === senderId);

        // Configure receiver state variables
        currentChunkIndex = 0;
        totalChunksCount = Math.ceil((incomingMetadata?.size || 0) / CHUNK_SIZE);
        receivedChunks = new Array(totalChunksCount);
        speedCalc.reset();

        set({
          transferId: incomingTransferId,
          role: "receiver",
          status: "CONNECTING",
          metadata: incomingMetadata || null,
          peerId: senderId,
          peerName: senderInfo?.fullName || senderInfo?.name || "Sender",
          peerAvatar: senderInfo?.profilePic || "/avatar.png",
          error: null,
          stats: null,
          downloadUrl: null,
        });

        toast.success("Code matched! Establishing WebRTC connection...", { id: "p2p-status" });
      };

      const errorHandler = ({ message }: { message: string }) => {
        toast.error(message || "Invalid or expired share code.", { id: "p2p-status" });
        set({ status: "IDLE", transferId: null, role: null, stats: null });
      };

      socket.on("file-transfer-signal", signalHandler);
      socket.on("share-code-matched", matchedHandler);
      socket.on("share-code-resolved", resolvedHandler);
      socket.on("share-code-error", errorHandler);

      socketSignalUnsubscribe = () => {
        socket.off("file-transfer-signal", signalHandler);
        socket.off("share-code-matched", matchedHandler);
        socket.off("share-code-resolved", resolvedHandler);
        socket.off("share-code-error", errorHandler);
      };
    },

    /**
     * Sender chooses a file to share.
     */
    selectFile: (file: File, peerId: string, peerName: string, peerAvatar: string) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || "File validation failed.");
        return;
      }

      const sanitizedName = sanitizeFilename(file.name);
      const id = crypto.randomUUID();

      // Configure sending variables
      currentChunkIndex = 0;
      totalChunksCount = Math.ceil(file.size / CHUNK_SIZE);
      lastAcknowledgedChunkIndex = -1;
      isWaitingForBuffer = false;
      speedCalc.reset();

      set({
        transferId: id,
        role: "sender",
        status: "PREVIEWING",
        file,
        metadata: {
          transferId: id,
          name: sanitizedName,
          size: file.size,
          type: file.type || "application/octet-stream",
        },
        peerId,
        peerName,
        peerAvatar,
        error: null,
        stats: null,
        downloadUrl: null,
      });
    },

    selectFileForCode: (file: File) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || "File validation failed.");
        return;
      }

      const sanitizedName = sanitizeFilename(file.name);
      const id = crypto.randomUUID();

      // Configure sending variables
      currentChunkIndex = 0;
      totalChunksCount = Math.ceil(file.size / CHUNK_SIZE);
      lastAcknowledgedChunkIndex = -1;
      isWaitingForBuffer = false;
      speedCalc.reset();

      set({
        transferId: id,
        role: "sender",
        status: "PREVIEWING",
        file,
        metadata: {
          transferId: id,
          name: sanitizedName,
          size: file.size,
          type: file.type || "application/octet-stream",
        },
        peerId: null,
        peerName: null,
        peerAvatar: null,
        error: null,
        stats: null,
        downloadUrl: null,
      });
    },

    clearSelection: () => {
      set({
        transferId: null,
        role: null,
        status: "IDLE",
        file: null,
        metadata: null,
        peerId: null,
        peerName: null,
        peerAvatar: null,
        stats: null,
      });
    },

    /**
     * Sender clicks "Send" to offer transfer to the receiver.
     */
    sendTransferRequest: () => {
      const { transferId, metadata, peerId } = get();
      if (!transferId || !metadata || !peerId) return;

      set({ status: "REQUESTING" });
      
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("file-transfer-signal", {
          receiverId: peerId,
          signal: {
            type: "request",
            transferId,
            metadata,
          },
        });
      }
    },

    /**
     * Receiver clicks "Accept" to begin connection.
     */
    acceptRequest: () => {
      const { transferId, peerId } = get();
      if (!transferId || !peerId) return;

      set({ status: "CONNECTING" });

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("file-transfer-signal", {
          receiverId: peerId,
          signal: {
            type: "accept",
            transferId,
          },
        });
      }
    },

    /**
     * Receiver clicks "Decline" or Reject.
     */
    declineRequest: () => {
      const { transferId, peerId } = get();
      if (!transferId || !peerId) return;

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("file-transfer-signal", {
          receiverId: peerId,
          signal: {
            type: "reject",
            transferId,
          },
        });
      }

      get().resetTransfer();
    },

    /**
     * Pause the transfer.
     */
    pauseTransfer: () => {
      const { status } = get();
      if (status !== "TRANSFERRING") return;

      set({ status: "PAUSED" });
      sendControlMessage("PAUSE");
      toast.success("Transfer paused");
    },

    /**
     * Resume the transfer.
     */
    resumeTransfer: () => {
      const { status, role } = get();
      if (status !== "PAUSED") return;

      set({ status: "TRANSFERRING" });

      if (role === "sender") {
        sendControlMessage("RESUME", { chunkIndex: lastAcknowledgedChunkIndex });
        sendNextChunks();
      } else {
        // Find highest contiguous received chunk index
        let lastContiguous = -1;
        for (let i = 0; i < totalChunksCount; i++) {
          if (receivedChunks[i] !== undefined) {
            lastContiguous = i;
          } else {
            break;
          }
        }
        sendControlMessage("RESUME", { chunkIndex: lastContiguous });
      }
      toast.success("Transfer resumed");
    },

    /**
     * Cancel the transfer.
     */
    cancelTransfer: () => {
      const { peerId } = get();
      
      // Send cancel via control message if open
      if (webRTC.channel && webRTC.channel.readyState === "open") {
        sendControlMessage("CANCEL");
      }

      // Also trigger via WebSockets signaling in case WebRTC isn't fully established
      if (peerId) {
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.emit("file-transfer-signal", {
            receiverId: peerId,
            signal: {
              type: "cancel",
              transferId: get().transferId || "",
            },
          });
        }
      }

      get().resetTransfer();
      toast.error("File sharing cancelled");
    },

    /**
     * Full state teardown.
     */
    resetTransfer: () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      
      webRTC.closeConnection();
      speedCalc.reset();
      
      currentChunkIndex = 0;
      totalChunksCount = 0;
      lastAcknowledgedChunkIndex = -1;
      isWaitingForBuffer = false;
      receivedChunks = [];

      // Revoke old download URL to avoid leaks
      const { downloadUrl } = get();
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      set({
        transferId: null,
        role: null,
        status: "IDLE",
        file: null,
        metadata: null,
        peerId: null,
        peerName: null,
        peerAvatar: null,
        error: null,
        stats: null,
        downloadUrl: null,
      });
    },

    /**
     * Handles signaling packets arriving via WebSockets.
     */
    handleIncomingSignal: async (senderId: string, signal: SignalingPayload) => {
      const { type, transferId: signalTransferId, metadata, sdp, candidate } = signal;
      const { transferId, status, role } = get();

      console.log(`Socket signal received: [${type}]`, signal);

      switch (type) {
        case "request":
          if (status !== "IDLE") {
            // Already busy with a transfer, auto-decline
            const socket = useAuthStore.getState().socket;
            socket?.emit("file-transfer-signal", {
              receiverId: senderId,
              signal: { type: "reject", transferId: signalTransferId, error: "Peer is busy with another transfer." },
            });
            return;
          }

          // Fetch sender info from online users
          const users = useChatStore.getState().users;
          const senderInfo = users.find((u: any) => u._id === senderId);

          // Configure receiving variables
          currentChunkIndex = 0;
          totalChunksCount = Math.ceil((metadata?.size || 0) / CHUNK_SIZE);
          receivedChunks = new Array(totalChunksCount);
          speedCalc.reset();

          set({
            transferId: signalTransferId,
            role: "receiver",
            status: "REQUESTED",
            metadata: metadata || null,
            peerId: senderId,
            peerName: senderInfo?.fullName || senderInfo?.name || "Someone",
            peerAvatar: senderInfo?.profilePic || "/avatar.png",
            error: null,
            stats: null,
            downloadUrl: null,
          });
          break;

        case "accept":
          if (signalTransferId !== transferId || role !== "sender") return;
          set({ status: "CONNECTING" });
          toast.loading("Receiver accepted! Creating connection...", { id: "transfer-status" });
          // Start the WebRTC Connection
          await webRTC.startConnection(senderId, transferId, rtcCallbacks);
          break;

        case "reject":
          if (signalTransferId !== transferId) return;
          set({ status: "IDLE", transferId: null, role: null, stats: null });
          toast.error("File sharing request declined by receiver");
          break;

        case "offer":
          if (signalTransferId !== transferId || !sdp) return;
          console.log("Receiver: Handling WebRTC SDP offer...");
          await webRTC.handleOffer(senderId, transferId, sdp, rtcCallbacks);
          break;

        case "answer":
          if (signalTransferId !== transferId || !sdp) return;
          console.log("Sender: Handling WebRTC SDP answer...");
          await webRTC.handleAnswer(sdp);
          break;

        case "candidate":
          if (signalTransferId !== transferId || !candidate) return;
          await webRTC.handleCandidate(candidate);
          break;

        case "cancel":
          if (signalTransferId !== transferId) return;
          get().resetTransfer();
          toast.error("File transfer cancelled by peer");
          break;
      }
    },
  };
});

// Helper to handle chat store queries since typescript imports can be circular
import { useChatStore } from "../store/useChatStore";
