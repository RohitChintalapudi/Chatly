import React from "react";
import { useFileTransferStore } from "../hooks/useFileTransfer";
import { useThemeStore } from "../store/useThemeStore";

interface NetworkTransferCanvasProps {
  senderAvatar: string;
  receiverAvatar: string;
  senderName: string;
  receiverName: string;
}

export const NetworkTransferCanvas: React.FC<NetworkTransferCanvasProps> = React.memo(({
  senderAvatar,
  receiverAvatar,
  senderName,
  receiverName,
}) => {
  const status = useFileTransferStore((s) => s.status);
  const speed = useFileTransferStore((s) => s.stats?.speed || 0);
  const { isDark } = useThemeStore();

  const isTransferring = status === "TRANSFERRING";

  return (
    <div className="relative w-full h-44 flex items-center justify-between px-10 select-none bg-[var(--surface-muted)] border border-[var(--line)]/10 rounded-2xl overflow-hidden glassmorphism shadow-inner">
      
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--line)_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      {/* Sender Info (Left) */}
      <div className="relative flex flex-col items-center z-10 w-24">
        <div className="relative">
          {isTransferring && (
            <span className="absolute -inset-1.5 rounded-full bg-[var(--accent)] opacity-20 animate-ping duration-1000" />
          )}
          <img
            src={senderAvatar}
            alt={senderName}
            className="w-14 h-14 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] object-cover shadow-[0_0_15px_rgba(0,0,0,0.15)]"
          />
        </div>
        <span className="mt-2 text-[11px] font-bold text-[var(--primary-text)] truncate max-w-full text-center">
          {senderName}
        </span>
        <span className="text-[9px] font-extrabold text-[var(--accent)] uppercase tracking-wider">
          Sender
        </span>
      </div>

      {/* Center Pathway & Animated Packets */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative h-full">
        {/* The Connection Line */}
        <div className="w-full h-1 bg-[var(--line)]/20 rounded-full relative overflow-hidden">
          {isTransferring && (
            <>
              {/* Glowing active bar */}
              <div className="absolute inset-0 bg-[var(--accent)]/30" />
              
              {/* Floating packets using pure CSS animation */}
              <div 
                className="absolute h-full w-2.5 bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" 
                style={{
                  animation: "p2p-flow 1.8s infinite linear"
                }}
              />
              <div 
                className="absolute h-full w-2 bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" 
                style={{
                  animation: "p2p-flow 1.8s infinite linear",
                  animationDelay: "0.6s"
                }}
              />
              <div 
                className="absolute h-full w-2 bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" 
                style={{
                  animation: "p2p-flow 1.8s infinite linear",
                  animationDelay: "1.2s"
                }}
              />
            </>
          )}
        </div>

        {/* CSS Keyframes injected directly in style tag */}
        <style>{`
          @keyframes p2p-flow {
            0% { left: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
        `}</style>

        {/* Center speed status readout */}
        <div className="mt-3 select-none">
          {status === "PAUSED" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 tracking-wider uppercase animate-pulse">
              Paused
            </span>
          ) : status === "CONNECTING" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] tracking-wider uppercase animate-pulse">
              Connecting...
            </span>
          ) : status === "TRANSFERRING" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 tracking-wider uppercase animate-pulse">
              {speed > 0 ? `${speed.toFixed(2)} MB/s` : "Streaming..."}
            </span>
          ) : null}
        </div>
      </div>

      {/* Receiver Info (Right) */}
      <div className="relative flex flex-col items-center z-10 w-24">
        <div className="relative">
          {isTransferring && (
            <span className="absolute -inset-1.5 rounded-full bg-[var(--accent)] opacity-15 animate-pulse" />
          )}
          <img
            src={receiverAvatar}
            alt={receiverName}
            className="w-14 h-14 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] object-cover shadow-[0_0_15px_rgba(0,0,0,0.15)]"
          />
        </div>
        <span className="mt-2 text-[11px] font-bold text-[var(--primary-text)] truncate max-w-full text-center">
          {receiverName}
        </span>
        <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider">
          Receiver
        </span>
      </div>
    </div>
  );
});

NetworkTransferCanvas.displayName = "NetworkTransferCanvas";

export default NetworkTransferCanvas;
