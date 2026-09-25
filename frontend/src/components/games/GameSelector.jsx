import React from "react";
import { GameCard } from "./GameCard";
import { ScoreBoard } from "./ScoreBoard";
import { useGamesStore } from "../../store/useGamesStore";
import { Volume2, VolumeX, X, Trophy } from "lucide-react";

export const GameSelector = ({ onClose, showClose = false }) => {
  const { highScores, setActiveGame, soundEnabled, toggleSound } = useGamesStore();

  const games = [
    { id: "flappy", isPopular: true, comingSoon: false },
    { id: "tetris", isPopular: false, comingSoon: true },
    { id: "snake", isPopular: false, comingSoon: true },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Arcade Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-[var(--line)]/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_var(--line)]">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)] tracking-tight">
                MINI GAMES ARCADE
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[var(--accent)] text-black border border-[var(--line)]">
                FLAPPABLE
              </span>
            </div>
            <p className="text-xs text-[var(--secondary-text)] font-semibold mt-0.5">
              Play fast retro mini games right inside Chatly without leaving your chat!
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`w-9 h-9 rounded-xl border-2 border-[var(--line)] flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled
                ? "bg-[var(--surface)] text-[var(--primary-text)] hover:bg-[var(--accent)]/10"
                : "bg-red-500/10 border-red-400 text-red-500"
            }`}
            title={soundEnabled ? "Mute Arcade Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {showClose && onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
              title="Close Arcade"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Main Game Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[var(--primary-text)] uppercase tracking-wider flex items-center gap-2">
            <span>🕹️</span> Choose a Game
          </h3>
          <span className="text-xs text-[var(--secondary-text)] font-bold">
            Instant Play &bull; Flappable Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {games.map((g) => (
            <GameCard
              key={g.id}
              gameId={g.id}
              highScore={highScores[g.id] || 0}
              isPopular={g.isPopular}
              comingSoon={g.comingSoon}
              onPlay={() => setActiveGame(g.id)}
            />
          ))}
        </div>
      </div>

      {/* Best Scores & Achievements Section */}
      <div className="pt-4 border-t-2 border-[var(--line)]/20">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-black text-[var(--primary-text)] uppercase tracking-wider">
            Arcade Trophy Room & Stats
          </h3>
        </div>
        <ScoreBoard />
      </div>
    </div>
  );
};
