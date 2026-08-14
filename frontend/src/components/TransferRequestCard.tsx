import React from "react";
import { getFileTypeInfo, sanitizeFilename } from "../utils/fileValidators";
import { FileMetadata } from "../types/fileTransfer";

interface TransferRequestCardProps {
  metadata: FileMetadata;
  peerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const TransferRequestCard: React.FC<TransferRequestCardProps> = ({
  metadata,
  peerName,
  onAccept,
  onDecline,
}) => {
  const { name, size, type } = metadata;
  
  // Format bytes into human readable format (MB, KB, etc.)
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fileUI = getFileTypeInfo(type, name);
  const Icon = fileUI.icon;

  return (
    <div 
      className="p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl shadow-[4px_4px_0px_0px_var(--line)] max-w-sm w-full mx-auto"
      role="dialog"
      aria-labelledby="req-title"
      aria-describedby="req-desc"
    >
      <div className="flex flex-col items-center text-center">
        {/* File Type Icon Bubble */}
        <div 
          className={`w-14 h-14 rounded-xl border-2 border-[var(--line)] flex items-center justify-center mb-4 ${fileUI.bgColorClass} ${fileUI.colorClass} shadow-[2px_2px_0px_0px_var(--line)]`}
          aria-hidden="true"
        >
          <Icon size={28} />
        </div>

        {/* File Name */}
        <h3 
          id="req-title"
          className="text-base font-extrabold text-[var(--primary-text)] break-all max-w-full px-2 leading-snug"
        >
          {sanitizeFilename(name)}
        </h3>

        {/* File Size */}
        <span 
          className="text-xs font-bold text-[var(--secondary-text)] mt-1.5"
          aria-label={`File size ${formatSize(size)}`}
        >
          {formatSize(size)}
        </span>

        {/* Request description */}
        <p 
          id="req-desc"
          className="text-xs font-medium text-[var(--primary-text)] mt-4 mb-6 leading-relaxed"
        >
          <span className="font-extrabold text-[var(--accent)]">{peerName}</span> wants to send you this file.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          {/* Decline Button */}
          <button
            onClick={onDecline}
            className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-red-500 hover:text-white transition-all cursor-pointer text-center hover:shadow-[2px_2px_0px_0px_var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Decline file transfer"
          >
            Decline
          </button>
          
          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] text-xs font-extrabold text-[var(--primary-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all cursor-pointer text-center hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Accept file transfer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
