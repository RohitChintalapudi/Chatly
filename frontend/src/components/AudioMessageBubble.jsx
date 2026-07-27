import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { formatDuration } from "../lib/utils";

const SPEED_OPTIONS = [1, 1.5, 2];

const AudioMessageBubble = ({ audioUrl, isSender }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => console.error("Playback error:", err));
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIndex);
    const newSpeed = SPEED_OPTIONS[nextIndex];
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 min-w-[240px] sm:min-w-[280px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm ${
            isSender
              ? "bg-black/10 border-black/20 text-black hover:bg-black/20"
              : "bg-[var(--accent)] border-[var(--line)] text-[var(--primary-text)] hover:bg-[var(--accent-hover)]"
          }`}
          title={isPlaying ? "Pause Voice Note" : "Play Voice Note"}
        >
          {isPlaying ? (
            <Pause size={18} className="fill-current" />
          ) : (
            <Play size={18} className="fill-current ml-0.5" />
          )}
        </button>

        {/* Dynamic Waveform & Progress Bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1 h-6 px-1">
            {/* Animated Audio Waveform Bars */}
            {[40, 70, 30, 90, 50, 80, 100, 45, 85, 35, 65, 95, 40, 75, 55].map((heightPct, idx) => {
              const isPassed = (idx / 15) * 100 <= progressPercent;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isPassed
                      ? isSender
                        ? "#000000"
                        : "var(--accent)"
                      : isSender
                      ? "rgba(0,0,0,0.2)"
                      : "var(--line)",
                    animationDelay: `${idx * 0.08}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Timeline Slider */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black dark:accent-[var(--accent)]"
          />
        </div>

        {/* Speed Toggle Button */}
        <button
          type="button"
          onClick={cycleSpeed}
          className={`px-2 py-1 rounded-md text-xs font-black border transition-all cursor-pointer ${
            isSender
              ? "border-black/20 bg-black/10 text-black hover:bg-black/20"
              : "border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] hover:bg-[var(--accent)]/10"
          }`}
          title="Change Playback Speed"
        >
          {SPEED_OPTIONS[speedIndex]}x
        </button>
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between text-[11px] font-bold opacity-80 px-1">
        <div className="flex items-center gap-1">
          <Volume2 size={12} />
          <span>Voice Note</span>
        </div>
        <span>
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};

export default AudioMessageBubble;
