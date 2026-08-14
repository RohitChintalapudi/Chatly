import { useAuthStore } from "../store/useAuthStore";
import { SignalingPayload } from "../types/fileTransfer";

const STUN_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export interface WebRTCManagerCallbacks {
  onConnectionStateChange: (state: RTCIceConnectionState) => void;
  onChannelStateChange: (state: RTCDataChannelState) => void;
  onMessageReceived: (data: string | ArrayBuffer) => void;
  onBufferedAmountLow?: () => void;
  onError: (error: Error) => void;
}

export class WebRTCManager {
  public pc: RTCPeerConnection | null = null;
  public channel: RTCDataChannel | null = null;
  private callbacks: WebRTCManagerCallbacks | null = null;
  private peerId: string | null = null;
  private transferId: string | null = null;
  private candidateQueue: RTCIceCandidateInit[] = [];

  constructor() {}

  private getSocket() {
    return useAuthStore.getState().socket;
  }

  /**
   * Send WebSockets signaling message to target peer.
   */
  private sendSignal(receiverId: string, signal: SignalingPayload) {
    const socket = this.getSocket();
    if (!socket) {
      console.error("Socket not connected, cannot send signaling message.");
      return;
    }
    socket.emit("file-transfer-signal", {
      receiverId,
      signal,
    });
  }

  /**
   * Clean up PeerConnection and DataChannel.
   */
  public closeConnection() {
    console.log("WebRTCManager: Cleaning up connections...");
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {}
      this.channel = null;
    }

    if (this.pc) {
      try {
        this.pc.close();
      } catch (e) {}
      this.pc = null;
    }

    this.peerId = null;
    this.transferId = null;
  }

  /**
   * Write data directly into the DataChannel.
   */
  public sendData(data: string | ArrayBuffer): boolean {
    if (this.channel && this.channel.readyState === "open") {
      this.channel.send(data as any);
      return true;
    }
    console.warn("WebRTCManager: DataChannel is not open. State:", this.channel?.readyState);
    return false;
  }

  /**
   * Set up DataChannel event listeners.
   */
  private setupDataChannel(channel: RTCDataChannel) {
    this.channel = channel;
    channel.binaryType = "arraybuffer";
    
    // Set buffer threshold to 64KB (triggers onbufferedamountlow when buffer drains below this size)
    channel.bufferedAmountLowThreshold = 65536;

    channel.onopen = () => {
      console.log("WebRTCManager: DataChannel opened:", channel.label);
      this.callbacks?.onChannelStateChange("open");
    };

    channel.onclose = () => {
      console.log("WebRTCManager: DataChannel closed:", channel.label);
      this.callbacks?.onChannelStateChange("closed");
    };

    channel.onerror = (errorEvent) => {
      console.error("WebRTCManager: DataChannel error:", errorEvent);
      this.callbacks?.onError(new Error("DataChannel error occurred."));
    };

    channel.onmessage = (event) => {
      this.callbacks?.onMessageReceived(event.data);
    };

    channel.onbufferedamountlow = () => {
      this.callbacks?.onBufferedAmountLow?.();
    };
  }

  /**
   * Initialize RTCPeerConnection.
   */
  private initPeerConnection(
    targetPeerId: string,
    transferId: string,
    callbacks: WebRTCManagerCallbacks
  ): RTCPeerConnection {
    this.closeConnection();

    this.peerId = targetPeerId;
    this.transferId = transferId;
    this.callbacks = callbacks;
    this.candidateQueue = [];

    console.log("WebRTCManager: Initializing RTCPeerConnection for", targetPeerId);
    const pc = new RTCPeerConnection(STUN_SERVERS);
    this.pc = pc;

    pc.oniceconnectionstatechange = () => {
      console.log("WebRTCManager: ICE Connection State:", pc.iceConnectionState);
      callbacks.onConnectionStateChange(pc.iceConnectionState);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && this.peerId && this.transferId) {
        this.sendSignal(this.peerId, {
          type: "candidate",
          transferId: this.transferId,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  }

  /**
   * Action: Start WebRTC Peer Connection (as Caller / Sender)
   */
  public async startConnection(
    targetPeerId: string,
    transferId: string,
    callbacks: WebRTCManagerCallbacks
  ) {
    try {
      const pc = this.initPeerConnection(targetPeerId, transferId, callbacks);

      console.log("WebRTCManager: Creating DataChannel: chatly-file-transfer");
      const channel = pc.createDataChannel("chatly-file-transfer", {
        ordered: true,
      });
      this.setupDataChannel(channel);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.sendSignal(targetPeerId, {
        type: "offer",
        transferId,
        sdp: offer,
      });
    } catch (error) {
      console.error("WebRTCManager: Error starting connection:", error);
      callbacks.onError(error as Error);
    }
  }

  /**
   * Action: Handle incoming SDP offer and reply with SDP answer (as Callee / Receiver)
   */
  public async handleOffer(
    senderId: string,
    transferId: string,
    offerSdp: RTCSessionDescriptionInit,
    callbacks: WebRTCManagerCallbacks
  ) {
    try {
      const pc = this.initPeerConnection(senderId, transferId, callbacks);

      pc.ondatachannel = (event) => {
        if (event.channel.label === "chatly-file-transfer") {
          console.log("WebRTCManager: Received incoming DataChannel");
          this.setupDataChannel(event.channel);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      await this.drainCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.sendSignal(senderId, {
        type: "answer",
        transferId,
        sdp: answer,
      });
    } catch (error) {
      console.error("WebRTCManager: Error handling SDP offer:", error);
      callbacks.onError(error as Error);
    }
  }

  /**
   * Action: Handle incoming SDP answer (as Caller / Sender)
   */
  public async handleAnswer(answerSdp: RTCSessionDescriptionInit) {
    try {
      if (this.pc) {
        console.log("WebRTCManager: Setting remote description (SDP Answer)");
        await this.pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        await this.drainCandidates();
      }
    } catch (error) {
      console.error("WebRTCManager: Error setting SDP answer:", error);
      this.callbacks?.onError(error as Error);
    }
  }

  /**
   * Action: Handle incoming ICE candidate (Both sides)
   */
  public async handleCandidate(candidateInit: RTCIceCandidateInit) {
    try {
      if (!this.pc || !this.pc.remoteDescription) {
        console.log("WebRTCManager: Remote description not set. Queuing ICE candidate.");
        this.candidateQueue.push(candidateInit);
        return;
      }
      console.log("WebRTCManager: Adding remote ICE Candidate");
      await this.pc.addIceCandidate(new RTCIceCandidate(candidateInit));
    } catch (error) {
      console.error("WebRTCManager: Error adding ICE candidate:", error);
    }
  }

  /**
   * Drains any queued ICE candidates.
   */
  private async drainCandidates() {
    if (!this.pc) return;
    console.log(`WebRTCManager: Draining ${this.candidateQueue.length} queued ICE candidates...`);
    for (const candidate of this.candidateQueue) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("WebRTCManager: Error adding queued candidate:", e);
      }
    }
    this.candidateQueue = [];
  }
}
