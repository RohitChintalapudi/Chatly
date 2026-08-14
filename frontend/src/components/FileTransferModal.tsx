import React, { useEffect } from "react";
import { useFileTransferStore } from "../hooks/useFileTransfer";
import { NetworkTransferCanvas } from "./NetworkTransferCanvas";
import { TransferRequestCard } from "./TransferRequestCard";
import { TransferProgress } from "./TransferProgress";
import { CompletedTransferCard } from "./CompletedTransferCard";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { getFileTypeInfo, sanitizeFilename } from "../utils/fileValidators";

export const FileTransferModal: React.FC = () => {
  const store = useFileTransferStore();

  // Listen to escape key for dismissals (Accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (store.status === "PREVIEWING" || store.status === "REQUESTING" || store.status === "REQUESTED") {
          store.cancelTransfer();
        } else if (store.status === "TRANSFERRING" || store.status === "PAUSED") {
          store.cancelTransfer();
        } else if (store.status === "COMPLETED" || store.status === "FAILED") {
          store.resetTransfer();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store.status]);

  if (store.status === "IDLE" || store.status === "SELECTING") {
    return null;
  }

  // Format size helper
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop Dismiss Wrapper (only for preview or finish states, not during active transfers to avoid accidental cancels) */}
        <div 
          className="absolute inset-0 cursor-default"
          onClick={() => {
            if (store.status === "PREVIEWING" || store.status === "COMPLETED" || store.status === "FAILED") {
              store.resetTransfer();
            }
          }}
        />

        {/* Modal Card content wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-[var(--surface)] border-2 border-[var(--line)] rounded-3xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_0px_var(--line)] z-10 glassmorphism p-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-4 border-b border-[var(--line)]/10 pb-3">
            <h2 className="text-sm font-black text-[var(--primary-text)] uppercase tracking-wider">
              File Share
            </h2>
            
            {/* Show Close Button only when not actively transferring */}
            {(store.status === "PREVIEWING" || store.status === "COMPLETED" || store.status === "FAILED") && (
              <button
                onClick={() => store.resetTransfer()}
                className="p-1 rounded-lg border border-[var(--line)]/10 bg-[var(--surface-muted)] text-[var(--secondary-text)] hover:text-[var(--primary-text)] cursor-pointer focus:outline-none"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Render State Views */}
          
          {/* 1. Previewing state (Sender side, file selected, before sending request) */}
          {store.status === "PREVIEWING" && store.metadata && (
            <div className="flex flex-col items-center text-center py-4">
              <div className={`w-14 h-14 rounded-xl border-2 border-[var(--line)] flex items-center justify-center mb-4 ${getFileTypeInfo(store.metadata.type, store.metadata.name).bgColorClass} ${getFileTypeInfo(store.metadata.type, store.metadata.name).colorClass}`}>
                {React.createElement(getFileTypeInfo(store.metadata.type, store.metadata.name).icon, { size: 28 })}
              </div>
              <h3 className="text-sm font-bold text-[var(--primary-text)] break-all max-w-full px-2">
                {sanitizeFilename(store.metadata.name)}
              </h3>
              <span className="text-xs text-[var(--secondary-text)] font-semibold mt-1">
                {formatSize(store.metadata.size)}
              </span>
              <p className="text-xs text-[var(--primary-text)] font-medium mt-4 mb-6">
                Share this file with <span className="font-extrabold text-[var(--accent)]">{store.peerName}</span> via WebRTC?
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => store.clearSelection()}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => store.sendTransferRequest()}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            </div>
          )}

          {/* 2. Requesting state (Sender side, request sent, waiting for reply) */}
          {store.status === "REQUESTING" && store.metadata && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-10 h-10 rounded-full border-2 border-[var(--line)] border-t-transparent animate-spin mb-4" />
              <h3 className="text-sm font-bold text-[var(--primary-text)] break-all max-w-full px-2">
                Awaiting response...
              </h3>
              <p className="text-xs text-[var(--secondary-text)] font-semibold mt-2">
                Waiting for <span className="text-[var(--primary-text)] font-extrabold">{store.peerName}</span> to accept the file transfer.
              </p>
              <button
                onClick={() => store.cancelTransfer()}
                className="mt-6 px-6 py-2 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* 3. Requested state (Receiver side, prompt accept or decline) */}
          {store.status === "REQUESTED" && store.metadata && (
            <TransferRequestCard
              metadata={store.metadata}
              peerName={store.peerName || "Someone"}
              onAccept={() => store.acceptRequest()}
              onDecline={() => store.declineRequest()}
            />
          )}

          {/* 4. Active Connections & Transfers (Both sides, shows visual Canvas + Progress) */}
          {(store.status === "CONNECTING" || store.status === "TRANSFERRING" || store.status === "PAUSED") && store.metadata && (
            <div className="flex flex-col gap-4">
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
          )}

          {/* 5. Completed state (Both sides) */}
          {store.status === "COMPLETED" && store.metadata && (
            <CompletedTransferCard
              metadata={store.metadata}
              role={store.role || "sender"}
              downloadUrl={store.downloadUrl}
              onDismiss={() => store.resetTransfer()}
            />
          )}

          {/* 6. Failed state (Error display) */}
          {store.status === "FAILED" && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500/30 text-red-500 flex items-center justify-center mb-4 shadow-sm">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-black text-[var(--primary-text)] mb-1">
                Transfer Failed
              </h3>
              <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider mb-3">
                Error Occurred
              </p>
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs font-bold text-red-500/90 break-all max-w-full mb-6">
                {store.error || "WebRTC connection dropped or checksum verification failed."}
              </div>
              <button
                onClick={() => store.resetTransfer()}
                className="w-full py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black cursor-pointer shadow-[2px_2px_0px_0px_var(--line)]"
              >
                Dismiss
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
