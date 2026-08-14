interface SpeedMeasurement {
  time: number; // timestamp
  bytes: number; // accumulated bytes
}

export class SpeedCalculator {
  private measurements: SpeedMeasurement[] = [];
  private readonly windowMs: number = 2000; // 2 seconds rolling window

  /**
   * Reset the speed measurements.
   */
  public reset() {
    this.measurements = [];
  }

  /**
   * Add a data point of current progress.
   * @param bytesTransferred The cumulative bytes transferred.
   */
  public update(bytesTransferred: number): number {
    const now = performance.now();
    this.measurements.push({ time: now, bytes: bytesTransferred });

    // Clean up measurements older than windowMs
    const cutoff = now - this.windowMs;
    while (this.measurements.length > 2 && this.measurements[0].time < cutoff) {
      this.measurements.shift();
    }

    if (this.measurements.length < 2) return 0;

    const first = this.measurements[0];
    const last = this.measurements[this.measurements.length - 1];

    const timeDiffSec = (last.time - first.time) / 1000;
    const bytesDiff = last.bytes - first.bytes;

    if (timeDiffSec <= 0 || bytesDiff <= 0) {
      return 0;
    }

    // Convert bytes/sec to MB/s
    const speedMBs = bytesDiff / timeDiffSec / (1024 * 1024);
    return Math.max(0, speedMBs);
  }
}
