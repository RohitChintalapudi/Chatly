import React, { useState, useRef, useEffect } from "react";
import { useFileTransferStore } from "../hooks/useFileTransfer";
import { useAuthStore } from "../store/useAuthStore";
import { getFileTypeInfo, sanitizeFilename } from "../utils/fileValidators";
import { NetworkTransferCanvas } from "../components/NetworkTransferCanvas";
import { TransferProgress } from "../components/TransferProgress";
import { CompletedTransferCard } from "../components/CompletedTransferCard";
import { 
  Send, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  FileText, 
  Upload, 
  KeyRound, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

export const P2PTestPage: React.FC = () => {
  const store = useFileTransferStore();
  const socket = useAuthStore((s) => s.socket);
  const initializeSocketListeners = useFileTransferStore((s) => s.initializeSocketListeners);

  // Initialize socket listeners on page mount/load
  useEffect(() => {
    if (socket) {
      initializeSocketListeners();
    }
  }, [socket, initializeSocketListeners]);

  // Local component states
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");
  const [shareCode, setShareCode] = useState<string>("");
  const [enteredCode, setEnteredCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Copy share code helper
  const handleCopyCode = () => {
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = () => {
    if (!store.file || !store.transferId || !store.metadata) return;
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setShareCode(code);
    
    // Register this code with backend socket
    if (socket) {
      const authUser = useAuthStore.getState().authUser;
      socket.emit("register-share-code", {
        code,
        transferId: store.transferId,
        metadata: store.metadata,
        senderName: authUser?.fullName || authUser?.name || "Sender",
        senderAvatar: authUser?.profilePic || "/avatar.png",
      });
      // Set state to REQUESTING (meaning code is generated and awaiting match)
      useFileTransferStore.setState({ status: "REQUESTING" });
      toast.success("Share code generated! Waiting for receiver...");
    } else {
      toast.error("Socket disconnected. Unable to generate share code.");
    }
  };

  const handleResolveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode || enteredCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    if (socket) {
      toast.loading("Connecting code...", { id: "p2p-status" });
      const authUser = useAuthStore.getState().authUser;
      socket.emit("resolve-share-code", {
        code: enteredCode,
        receiverName: authUser?.fullName || authUser?.name || "Receiver",
        receiverAvatar: authUser?.profilePic || "/avatar.png",
      });
    } else {
      toast.error("Socket disconnected. Unable to resolve share code.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Select the file inside store for code sharing (peerId = null initially)
    store.selectFileForCode(file);
    e.target.value = "";
  };

  // Format sizes
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Clean layout helper
  const isTransferring = 
    store.status === "CONNECTING" || 
    store.status === "TRANSFERRING" || 
    store.status === "PAUSED";

  // If a transfer is active (connecting/transferring), show the dynamic screen directly
  if (isTransferring && store.metadata) {
    return (
      <div className="pt-32 xl:pt-24 px-6 pb-6 max-w-xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col justify-start">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-black text-[var(--primary-text)]">Active P2P Sharing</h2>
          <p className="text-xs text-[var(--secondary-text)] font-semibold mt-1">
            Data is traveling directly between browsers via secure WebRTC DataChannel.
          </p>
        </div>
        
        <div className="flex flex-col gap-5">
          <NetworkTransferCanvas
            senderAvatar={store.role === "sender" ? "/avatar.png" : store.peerAvatar || "/avatar.png"}
            receiverAvatar={store.role === "receiver" ? "/avatar.png" : store.peerAvatar || "/avatar.png"}
            senderName={store.role === "sender" ? "You" : store.peerName || "Sender"}
            receiverName={store.role === "receiver" ? "You" : store.peerName || "Receiver"}
          />
          <TransferProgress
            stats={store.stats}
            metadata={store.metadata}
            role={store.role || "sender"}
            isPaused={store.status === "PAUSED"}
            onPause={() => store.pauseTransfer()}
            onResume={() => store.resumeTransfer()}
            onCancel={() => store.cancelTransfer()}
          />
        </div>
      </div>
    );
  }

  // If completed, render completion details
  if (store.status === "COMPLETED" && store.metadata) {
    return (
      <div className="pt-32 xl:pt-28 px-6 pb-6 max-w-md mx-auto min-h-[calc(100vh-6rem)]">
        <CompletedTransferCard
          metadata={store.metadata}
          role={store.role || "sender"}
          downloadUrl={store.downloadUrl}
          onDismiss={() => {
            store.resetTransfer();
            setShareCode("");
            setEnteredCode("");
          }}
        />
      </div>
    );
  }

  // If failed, render error details
  if (store.status === "FAILED") {
    return (
      <div className="pt-32 xl:pt-28 px-6 pb-6 max-w-sm mx-auto min-h-[calc(100vh-6rem)]">
        <div className="p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl shadow-[4px_4px_0px_0px_var(--line)] text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-black text-[var(--primary-text)] mb-1">Transfer Failed</h3>
          <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider mb-4">Connection Aborted</p>
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs font-bold text-red-500/90 break-all mb-6 leading-relaxed">
            {store.error || "P2P socket handshake timed out or connection disconnected."}
          </div>
          <button
            onClick={() => {
              store.resetTransfer();
              setShareCode("");
              setEnteredCode("");
            }}
            className="w-full py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black cursor-pointer shadow-[2px_2px_0px_0px_var(--line)]"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // Standard File Sharing Tabs View
  return (
    <div className="pt-32 xl:pt-24 px-6 pb-6 max-w-lg mx-auto min-h-[calc(100vh-6rem)] flex flex-col justify-start">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[var(--primary-text)] tracking-tight">
          Secure P2P File Share
        </h1>
        <p className="text-xs text-[var(--secondary-text)] font-semibold mt-1.5 leading-relaxed">
          Share files directly between browsers. Encrypted, private, and fast. No file data ever touches our servers.
        </p>
      </div>

      {/* Tabs Menu */}
      {store.status === "IDLE" && (
        <div className="flex bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-xl p-1 mb-6 shadow-[2px_2px_0px_0px_var(--line)]">
          <button
            onClick={() => setActiveTab("send")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              activeTab === "send"
                ? "bg-[var(--accent)] text-black border-2 border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)]"
                : "text-[var(--secondary-text)] border-2 border-transparent hover:text-[var(--primary-text)]"
            }`}
          >
            Send File
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              activeTab === "receive"
                ? "bg-[var(--accent)] text-black border-2 border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)]"
                : "text-[var(--secondary-text)] border-2 border-transparent hover:text-[var(--primary-text)]"
            }`}
          >
            Receive File
          </button>
        </div>
      )}

      {/* Tab Panels */}
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl p-6 shadow-[4px_4px_0px_0px_var(--line)] min-h-[260px] flex flex-col justify-center">
        {activeTab === "send" ? (
          /* SEND SECTION */
          <div className="w-full flex flex-col items-center">
            {/* 1. Upload selection zone */}
            {store.status === "IDLE" && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[var(--line)]/30 rounded-xl p-8 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer flex flex-col items-center text-center transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] border border-[var(--line)]/15 text-[var(--secondary-text)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/50 flex items-center justify-center mb-3 transition-colors shadow-sm">
                  <Upload size={22} />
                </div>
                <span className="text-xs font-extrabold text-[var(--primary-text)]">Choose file to share</span>
                <span className="text-[10px] text-[var(--secondary-text)] font-semibold mt-1">Accepts any format under 1GB</span>
              </div>
            )}

            {/* 2. File selected (Previewing / Generating code) */}
            {store.status === "PREVIEWING" && store.metadata && (
              <div className="w-full flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-xl border-2 border-[var(--line)] flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_var(--line)] ${getFileTypeInfo(store.metadata.type, store.metadata.name).bgColorClass} ${getFileTypeInfo(store.metadata.type, store.metadata.name).colorClass}`}>
                  {React.createElement(getFileTypeInfo(store.metadata.type, store.metadata.name).icon, { size: 28 })}
                </div>
                <h3 className="text-xs font-extrabold text-[var(--primary-text)] break-all max-w-full px-2">
                  {sanitizeFilename(store.metadata.name)}
                </h3>
                <span className="text-[10px] text-[var(--secondary-text)] font-bold mt-1">
                  {formatSize(store.metadata.size)} • {getFileTypeInfo(store.metadata.type, store.metadata.name).label}
                </span>

                <div className="flex gap-3 w-full mt-6">
                  <button
                    onClick={() => store.clearSelection()}
                    className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-bold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateCode}
                    className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound size={14} />
                    Generate Code
                  </button>
                </div>
              </div>
            )}

            {/* 3. Awaiting receiver code entry */}
            {store.status === "REQUESTING" && store.metadata && (
              <div className="w-full flex flex-col items-center text-center">
                <span className="text-[10px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider mb-2">Share Code</span>
                
                {/* 6-Digit Code Display */}
                <div className="flex items-center gap-2.5 mb-5 select-all">
                  {shareCode.split("").map((digit, idx) => (
                    <div 
                      key={idx} 
                      className="w-10 h-12 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] flex items-center justify-center text-lg font-black text-[var(--primary-text)] shadow-[2px_2px_0px_0px_var(--line)] font-mono"
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)]/15 bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[10px] font-bold text-[var(--primary-text)] cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy Code"}
                  </button>
                </div>

                {/* File box summary */}
                <div className="w-full p-3.5 rounded-xl border border-[var(--line)]/15 bg-[var(--surface-muted)] flex items-center gap-3 text-left mb-6">
                  <div className={`p-2 rounded-lg border border-[var(--line)]/10 ${getFileTypeInfo(store.metadata.type, store.metadata.name).bgColorClass} ${getFileTypeInfo(store.metadata.type, store.metadata.name).colorClass}`}>
                    {React.createElement(getFileTypeInfo(store.metadata.type, store.metadata.name).icon, { size: 18 })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-extrabold text-[var(--primary-text)] truncate">{sanitizeFilename(store.metadata.name)}</h4>
                    <span className="text-[9px] font-bold text-[var(--secondary-text)]">{formatSize(store.metadata.size)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[var(--secondary-text)] font-semibold animate-pulse mb-6">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  Waiting for receiver to enter code...
                </div>

                <button
                  onClick={() => {
                    store.cancelTransfer();
                    setShareCode("");
                  }}
                  className="w-full py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-bold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  Cancel Transfer
                </button>
              </div>
            )}
          </div>
        ) : (
          /* RECEIVE SECTION */
          <form onSubmit={handleResolveCode} className="w-full flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] border border-[var(--line)]/15 text-[var(--secondary-text)] flex items-center justify-center mb-4 shadow-sm">
              <KeyRound size={22} />
            </div>
            
            <h3 className="text-xs font-extrabold text-[var(--primary-text)] mb-1">Enter Share Code</h3>
            <p className="text-[10px] text-[var(--secondary-text)] font-semibold text-center mb-5 max-w-xs leading-relaxed">
              Enter the 6-digit code generated by the sender to establish a secure peer connection.
            </p>

            {/* Digits Entry */}
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full max-w-[200px] text-center tracking-[12px] pl-3 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-xl placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] font-mono shadow-[2px_2px_0px_0px_var(--line)] mb-6"
            />

            <button
              type="submit"
              disabled={enteredCode.length !== 6}
              className="w-full py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 text-black font-extrabold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:-translate-y-0 disabled:shadow-none flex items-center justify-center gap-1.5"
            >
              Connect & Receive
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>

      {/* Trust Badge / Security Summary */}
      <div className="mt-8 flex items-start gap-2.5 bg-[var(--surface-muted)] border border-[var(--line)]/10 rounded-xl p-3.5 shadow-inner">
        <ShieldCheck className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
        <div className="text-[10px] leading-relaxed text-[var(--secondary-text)] font-bold">
          <span className="text-[var(--primary-text)] font-extrabold">Peer-to-Peer Encryption:</span> Once codes are matched, connections are negotiated directly between browsers. Your file does not upload to any cloud storage, which ensures 100% security, zero bandwidth caps, and fast transfer speed.
        </div>
      </div>
    </div>
  );
};

export default P2PTestPage;
