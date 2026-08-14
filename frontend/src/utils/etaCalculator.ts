/**
 * Calculates the ETA (in seconds) for a file transfer.
 * @param remainingBytes Bytes left to transfer.
 * @param speedMBs Current speed in Megabytes per second.
 */
export const calculateETA = (remainingBytes: number, speedMBs: number): number => {
  if (speedMBs <= 0 || remainingBytes <= 0) return 0;
  
  const speedBytes = speedMBs * 1024 * 1024;
  return Math.ceil(remainingBytes / speedBytes);
};

/**
 * Formats seconds into a human-readable ETA string.
 */
export const formatETA = (etaSeconds: number): string => {
  if (etaSeconds <= 0 || isNaN(etaSeconds) || !isFinite(etaSeconds)) {
    return "--";
  }

  if (etaSeconds < 60) {
    return `${etaSeconds}s`;
  }

  const minutes = Math.floor(etaSeconds / 60);
  const seconds = etaSeconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;

  return `${hours}h ${remMinutes}m`;
};
