import React, { useState } from "react";
import { FileMetadata } from "../types/fileTransfer";
import { getFileTypeInfo, sanitizeFilename } from "../utils/fileValidators";
import { Check, Download, ExternalLink } from "lucide-react";

interface CompletedTransferCardProps {
  metadata: FileMetadata;
  role: "sender" | "receiver";
  downloadUrl: string | null;
  onDismiss: () => void;
}

export const CompletedTransferCard: React.FC<CompletedTransferCardProps> = ({
  metadata,
  role,
  downloadUrl,
  onDismiss,
}) => {
  const { name, size, type } = metadata;
  const fileUI = getFileTypeInfo(type, name);
  const Icon = fileUI.icon;

  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div 
      className="p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl shadow-[4px_4px_0px_0px_var(--line)] max-w-sm w-full mx-auto"
      role="dialog"
      aria-label="File transfer completed details"
    >
      <div className="flex flex-col items-center text-center">
        {/* Animated Checkmark and Pulse Wrapper */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Animated pulsing background rings */}
          <span className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
          <span className="absolute w-16 h-16 rounded-full bg-emerald-500/30 animate-pulse" />
          
          <div className="relative w-12 h-12 rounded-full bg-emerald-500 border-2 border-[var(--line)] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_var(--line)]">
            <Check size={24} className="stroke-[3]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-[var(--primary-text)] mb-1">
          {role === "sender" ? "File Sent!" : "File Received!"}
        </h3>
        <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider mb-4">
          Transfer Complete
        </p>

        {/* File Preview Card */}
        <div className="w-full p-4 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] mb-6 flex flex-col items-center">
          {/* Image/Video Preview */}
          {role === "receiver" && downloadUrl && isImage && (
            <div className="w-full max-h-36 overflow-hidden rounded-lg mb-3 border border-[var(--line)]/10 flex justify-center bg-[var(--surface)]">
              <img 
                src={downloadUrl} 
                alt="Received Attachment" 
                className="max-h-36 object-contain"
              />
            </div>
          )}

          {role === "receiver" && downloadUrl && isVideo && (
            <div className="w-full max-h-36 overflow-hidden rounded-lg mb-3 border border-[var(--line)]/10 flex justify-center bg-[var(--surface)]">
              <video 
                src={downloadUrl} 
                controls 
                className="max-h-36 object-contain"
              />
            </div>
          )}

          {/* Fallback File Card Info */}
          <div className="flex items-center gap-3 w-full text-left">
            <div className={`p-2.5 rounded-lg border border-[var(--line)]/15 ${fileUI.bgColorClass} ${fileUI.colorClass}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[var(--primary-text)] truncate">
                {sanitizeFilename(name)}
              </h4>
              <span className="text-[10px] font-bold text-[var(--secondary-text)]">
                {formatSize(size)} • {fileUI.label}
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-3 w-full">
          {role === "receiver" && downloadUrl ? (
            <>
              {/* Dismiss / Ok */}
              <button
                onClick={onDismiss}
                className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                Close
              </button>

              {/* Download Anchor Button */}
              <a
                href={downloadUrl}
                download={sanitizeFilename(name)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 text-black transition-all cursor-pointer"
                aria-label={`Download file ${name}`}
              >
                <Download size={14} />
                Download
              </a>
            </>
          ) : (
            <button
              onClick={onDismiss}
              className="w-full py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] text-black transition-all cursor-pointer"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
