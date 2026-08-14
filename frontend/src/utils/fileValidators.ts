import { 
  FileText, 
  Image, 
  Video, 
  FileCode, 
  Music, 
  Archive, 
  FileCheck, 
  HelpCircle,
  LucideIcon 
} from "lucide-react";

const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB in bytes

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates file size and format.
 * Returns an error message if invalid.
 */
export const validateFile = (file: File): FileValidationResult => {
  if (!file) {
    return { isValid: false, error: "No file selected." };
  }

  // Max 1GB limit
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size exceeds 1GB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).` 
    };
  }

  return { isValid: true };
};

/**
 * Sanitizes filenames to prevent directory traversal and injection attacks.
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return "unnamed_file";
  
  // Remove directory traversal patterns like ../ or ..\
  let cleanName = filename.replace(/\.\.+\//g, "").replace(/\.\.+\\/g, "");
  
  // Keep only alphanumeric characters, spaces, dashes, underscores, and dots
  cleanName = cleanName.replace(/[^a-zA-Z0-9_\-\s.]/g, "_");
  
  // Limit length to prevent overflow issues
  if (cleanName.length > 255) {
    const extIdx = cleanName.lastIndexOf(".");
    const ext = extIdx !== -1 ? cleanName.slice(extIdx) : "";
    cleanName = cleanName.slice(0, 255 - ext.length) + ext;
  }
  
  return cleanName || "sanitized_file";
};

/**
 * Get visual helper properties for a file type (icon, colors, description).
 */
export interface FileTypeUIInfo {
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
  label: string;
}

export const getFileTypeInfo = (mimeType: string, filename: string): FileTypeUIInfo => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  const mime = mimeType.toLowerCase();

  // Images
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(extension)) {
    return {
      icon: Image,
      colorClass: "text-orange-500",
      bgColorClass: "bg-orange-500/10 border-orange-500/20",
      label: "Image",
    };
  }

  // Videos
  if (mime.startsWith("video/") || ["mp4", "webm", "ogg", "mkv", "avi", "mov"].includes(extension)) {
    return {
      icon: Video,
      colorClass: "text-red-500",
      bgColorClass: "bg-red-500/10 border-red-500/20",
      label: "Video",
    };
  }

  // Audio
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension)) {
    return {
      icon: Music,
      colorClass: "text-emerald-500",
      bgColorClass: "bg-emerald-500/10 border-emerald-500/20",
      label: "Audio",
    };
  }

  // PDF
  if (mime === "application/pdf" || extension === "pdf") {
    return {
      icon: FileCheck,
      colorClass: "text-rose-500",
      bgColorClass: "bg-rose-500/10 border-rose-500/20",
      label: "PDF Document",
    };
  }

  // Archives / Zip
  if (
    [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-tar",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ].includes(mime) ||
    ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)
  ) {
    return {
      icon: Archive,
      colorClass: "text-yellow-500",
      bgColorClass: "bg-yellow-500/10 border-yellow-500/20",
      label: "Archive",
    };
  }

  // Text files
  if (mime.startsWith("text/") || ["txt", "md", "csv", "log"].includes(extension)) {
    return {
      icon: FileText,
      colorClass: "text-cyan-500",
      bgColorClass: "bg-cyan-500/10 border-cyan-500/20",
      label: "Text File",
    };
  }

  // Office documents
  if (
    [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(mime) ||
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"].includes(extension)
  ) {
    return {
      icon: FileText,
      colorClass: "text-blue-500",
      bgColorClass: "bg-blue-500/10 border-blue-500/20",
      label: "Office Document",
    };
  }

  // Code files
  if (["js", "ts", "jsx", "tsx", "html", "css", "json", "py", "cpp", "c", "java", "sh"].includes(extension)) {
    return {
      icon: FileCode,
      colorClass: "text-violet-500",
      bgColorClass: "bg-violet-500/10 border-violet-500/20",
      label: "Source Code",
    };
  }

  // Unknown/Binary files
  return {
    icon: HelpCircle,
    colorClass: "text-[var(--secondary-text)]",
    bgColorClass: "bg-[var(--surface-muted)] border-[var(--line)]/20",
    label: "Binary File",
  };
};
