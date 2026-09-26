import React from "react";
import { Play, Trophy, Sparkles, Clock } from "lucide-react";
import { GAME_METADATA } from "../../store/useGamesStore";

export const GameCard = ({
  gameId,
  highScore = 0,
  onPlay,
  isPopular = false,
  comingSoon = false,
}) => {
  const meta = GAME_METADATA[gameId] || {
    title: "Game",
    emoji: "🎮",
    tagline: "Play mini game",
    badge: "Arcade",
    color: "#f97316",
    themeGradient: "from-orange-500/20 to-amber-500/10",
  };

  return (
    <div
      onClick={!comingSoon ? onPlay : undefined}
      className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] transition-all duration-300 select-none overflow-hidden ${
        comingSoon
          ? "opacity-75 cursor-not-allowed"
          : "hover:shadow-[6px_6px_0px_0px_var(--line)] hover:-translate-y-1.5 cursor-pointer"
      }`}
    >
      {/* Background glow & subtle gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${meta.themeGradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      {/* Top Bar: Badge & High Score */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--line)]/30 bg-[var(--surface)]/90 backdrop-blur-sm text-[var(--primary-text)] shadow-sm">
          {isPopular && <Sparkles className="w-3 h-3 text-amber-500" />}
          {comingSoon ? "Coming Soon" : meta.badge}
        </span>

        {!comingSoon && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface)]/90 border border-[var(--line)]/30 text-[11px] font-mono font-black text-[var(--primary-text)] shadow-sm">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>{highScore}</span>
          </div>
        )}
      </div>

      {/* Main Center Preview & Info */}
      <div className="relative z-10 space-y-3 my-2">
        {/* Animated Game Character / Graphic Preview */}
        <div className="flex justify-center py-2">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] flex items-center justify-center text-4xl sm:text-5xl shadow-[4px_4px_0px_0px_var(--line)] transition-transform duration-300 ${
              !comingSoon ? "group-hover:scale-110 group-hover:rotate-3" : "grayscale opacity-80"
            }`}
          >
            {meta.emoji}
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-[var(--primary-text)] tracking-tight">
            {meta.title}
          </h3>
          <p className="text-xs text-[var(--secondary-text)] font-semibold leading-relaxed line-clamp-2 px-1">
            {comingSoon ? "Preparing next arcade release." : meta.tagline}
          </p>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="relative z-10 mt-4 pt-2">
        {comingSoon ? (
          <div className="w-full py-2.5 sm:py-3 rounded-2xl border-2 border-[var(--line)]/40 bg-[var(--surface-muted)] text-[var(--secondary-text)] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>COMING SOON</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="w-full py-2.5 sm:py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-[var(--accent-hover)] group-hover:shadow-[3px_3px_0px_0px_var(--line)] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current stroke-[2]" />
            <span>PLAY NOW</span>
          </button>
        )}
      </div>
    </div>
  );
};
