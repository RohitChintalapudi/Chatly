import React from "react";
import { ArrowLeft, Volume2, VolumeX, Pause, Play, RotateCcw, X, Trophy } from "lucide-react";
import { useGamesStore, GAME_METADATA } from "../../store/useGamesStore";

export const GameHeader = ({
  gameId,
  score = 0,
  highScore = 0,
  extraBadges = [],
  isPaused = false,
  isPlaying = false,
  onPauseToggle,
  onRestart,
  onBack,
  showClose = false,
  onClose,
}) => {
  const { soundEnabled, toggleSound, setActiveGame } = useGamesStore();
  const meta = GAME_METADATA[gameId] || { title: "Game", emoji: "🎮" };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveGame(null);
    }
  };

  return (
    <div className="w-full bg-[var(--surface)] border-b-2 border-[var(--line)] px-3 sm:px-5 py-2.5 sm:py-3 transition-colors">
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            title="Back to Game Selection"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arcade</span>
          </button>

          <div className="flex items-center gap-2 truncate">
            <span className="text-xl sm:text-2xl select-none">{meta.emoji}</span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-[var(--primary-text)] truncate leading-tight">
                {meta.title}
              </h2>
              <span className="text-[10px] font-bold text-[var(--secondary-text)] hidden xs:block">
                Chatly Mini Games
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Score Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0 order-3 sm:order-2">
          {/* Current Score */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--accent)]/15 border-2 border-[var(--line)]">
            <span className="text-[10px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider">
              Score
            </span>
            <span className="font-mono font-black text-sm text-[var(--primary-text)]">
              {score}
            </span>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--line)]/40">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-[var(--secondary-text)] hidden md:inline">
              Best
            </span>
            <span className="font-mono font-extrabold text-xs text-[var(--primary-text)]">
              {highScore}
            </span>
          </div>

          {/* Custom Extra Badges (e.g. Lines / Level / Apples) */}
          {extraBadges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--line)]/30 text-[11px] font-bold text-[var(--primary-text)]"
            >
              {badge.icon && <span className="text-xs">{badge.icon}</span>}
              <span className="text-[10px] text-[var(--secondary-text)]">{badge.label}:</span>
              <span className="font-mono font-black">{badge.value}</span>
            </div>
          ))}
        </div>

        {/* Right: Controls (Sound, Pause, Restart, Close) */}
        <div className="flex items-center gap-1.5 order-2 sm:order-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`w-8 h-8 rounded-xl border-2 border-[var(--line)] flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled
                ? "bg-[var(--surface)] text-[var(--primary-text)] hover:bg-[var(--accent)]/10"
                : "bg-red-500/10 border-red-400 text-red-500 hover:bg-red-500/20"
            }`}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Pause / Resume Button */}
          {onPauseToggle && isPlaying && (
            <button
              onClick={onPauseToggle}
              className={`w-8 h-8 rounded-xl border-2 border-[var(--line)] flex items-center justify-center transition-all cursor-pointer ${
                isPaused
                  ? "bg-amber-500 text-white shadow-[2px_2px_0px_0px_var(--line)]"
                  : "bg-[var(--surface)] text-[var(--primary-text)] hover:bg-[var(--surface-muted)]"
              }`}
              title={isPaused ? "Resume Game (P)" : "Pause Game (P)"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Restart Button */}
          {onRestart && (
            <button
              onClick={onRestart}
              className="w-8 h-8 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] hover:bg-amber-500/15 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer"
              title="Restart Game (R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Modal Button */}
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer ml-1"
              title="Close Arcade"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
