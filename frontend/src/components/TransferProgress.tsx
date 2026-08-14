import React from "react";
import { TransferStats, FileMetadata } from "../types/fileTransfer";
import { formatETA } from "../utils/etaCalculator";
import { Play, Pause, X } from "lucide-react";

interface TransferProgressProps {
  stats: TransferStats | null;
  metadata: FileMetadata;
  role: "sender" | "receiver";
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export const TransferProgress: React.FC<TransferProgressProps> = ({
  stats,
  metadata,
  role,
  isPaused,
  onPause,
  onResume,
  onCancel,
}) => {
  const size = metadata.size;
  const progress = stats?.progress ?? 0;
  const speed = stats?.speed ?? 0;
  const transferred = stats?.transferredBytes ?? 0;
  const remaining = stats?.remainingBytes ?? size;
  const eta = stats?.eta ?? 0;
  const currentChunk = stats?.currentChunk ?? 0;
  const totalChunks = stats?.totalChunks ?? 0;

  // Format bytes to MB
  const toMB = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  // Generate ASCII progress bar e.g. █████████░░
  const getAsciiBar = (pct: number): string => {
    const totalBars = 12;
    const filledBars = Math.round((pct / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return "█".repeat(filledBars) + "░".repeat(emptyBars);
  };

  return (
    <div 
      className="w-full max-w-sm mx-auto p-5 bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl shadow-[4px_4px_0px_0px_var(--line)]"
      role="region"
      aria-label="File transfer progress details"
    >
      {/* Realtime progress percentages */}
      <div className="flex items-end justify-between mb-2">
        <span className="text-[10px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider">
          {role === "sender" ? "Uploading" : "Downloading"}
        </span>
        <span className="text-xl font-black text-[var(--primary-text)] font-mono tracking-tighter">
          {progress}%
        </span>
      </div>

      {/* Retro Neumorphic Progress Bar */}
      <div className="w-full h-4 bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-lg overflow-hidden relative mb-4">
        <div
          className="h-full bg-[var(--accent)] border-r-2 border-[var(--line)] transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Screen-reader accessible ASCII representation */}
      <div className="sr-only" aria-live="polite">
        {role === "sender" ? "Sender" : "Receiver"}: {getAsciiBar(progress)} {progress}%
      </div>

      {/* Tech stats grids */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t-2 border-b-2 border-[var(--line)] py-4 mb-5 text-[11px] font-bold text-[var(--primary-text)]">
        {/* Speed */}
        <div className="flex flex-col">
          <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider mb-0.5">Speed</span>
          <span className="font-mono text-xs font-black">
            {isPaused ? "0.00 MB/s" : `${speed.toFixed(2)} MB/s`}
          </span>
        </div>

        {/* ETA */}
        <div className="flex flex-col">
          <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider mb-0.5">ETA</span>
          <span className="font-mono text-xs font-black">
            {isPaused ? "Paused" : formatETA(eta)}
          </span>
        </div>

        {/* Transferred size */}
        <div className="flex flex-col">
          <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider mb-0.5">Transferred</span>
          <span className="font-mono">
            {toMB(transferred)} / {toMB(size)} MB
          </span>
        </div>

        {/* Remaining size */}
        <div className="flex flex-col">
          <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider mb-0.5">Remaining</span>
          <span className="font-mono">{toMB(remaining)} MB</span>
        </div>

        {/* Chunk ratios */}
        <div className="flex flex-col col-span-2">
          <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider mb-0.5">Packet Blocks</span>
          <div className="flex justify-between font-mono text-[10px] text-[var(--secondary-text)]">
            <span>Chunk {currentChunk}</span>
            <span>Total {totalChunks}</span>
          </div>
        </div>
      </div>

      {/* Operational Actions */}
      <div className="flex items-center gap-3 w-full">
        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-extrabold hover:bg-red-500 hover:text-white transition-all cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          aria-label="Cancel file transfer"
        >
          <X size={14} />
          Cancel
        </button>

        {/* Pause / Resume Button */}
        {isPaused ? (
          <button
            onClick={onResume}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] transition-all cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Resume file transfer"
          >
            <Play size={14} fill="black" />
            Resume
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-extrabold hover:bg-yellow-500 hover:text-black transition-all cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Pause file transfer"
          >
            <Pause size={14} />
            Pause
          </button>
        )}
      </div>
    </div>
  );
};
