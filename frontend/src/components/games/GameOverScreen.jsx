import React, { useEffect } from "react";
import { RotateCcw, ArrowLeft, Trophy, Share2, Sparkles, Send } from "lucide-react";
import { useGamesStore, GAME_METADATA } from "../../store/useGamesStore";
import { useChatStore } from "../../store/useChatStore";
import { playHighScoreSound, playGameOverSound } from "../../utils/soundEffects";
import toast from "react-hot-toast";

export const GameOverScreen = ({
  gameId,
  score = 0,
  isNewHighScore = false,
  highScore = 0,
  extraStats = {},
  onPlayAgain,
  onBackToMenu,
}) => {
  const { soundEnabled, setActiveGame, generateChallengeText } = useGamesStore();
  const { selectedUser, sendMessage } = useChatStore();
  const meta = GAME_METADATA[gameId] || { title: "Game", emoji: "🐦" };

  useEffect(() => {
    if (isNewHighScore) {
      playHighScoreSound(soundEnabled);
    } else {
      playGameOverSound(soundEnabled);
    }
  }, [isNewHighScore, soundEnabled]);

  const handleShareToChat = async () => {
    const text = generateChallengeText(gameId, score);
    if (selectedUser) {
      try {
        await sendMessage({ text });
        toast.success(`Challenge sent to ${selectedUser.fullName}! 🚀`);
      } catch (err) {
        console.error(err);
        toast.error("Could not send to chat. Challenge copied to clipboard!");
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Arcade Challenge copied to clipboard! Share it in any chat 📋");
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 w-full h-full min-h-full">
      <div className="w-full max-w-sm bg-[var(--surface)] border-2 sm:border-3 border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_var(--line)] text-center space-y-4 transition-colors relative my-auto">
        {/* Glow effect for high score */}
        {isNewHighScore && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/25 rounded-full blur-2xl pointer-events-none animate-pulse" />
        )}

        {/* Header Icon / Title */}
        <div className="space-y-1">
          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border-2 border-amber-500 text-amber-600 font-black text-xs uppercase tracking-wider animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              New High Score! 🏆
            </div>
          ) : (
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--secondary-text)]">
              {gameId === "flappy" ? "Flight Over" : "Game Over"}
            </span>
          )}
          <h3 className="text-xl sm:text-2xl font-black text-[var(--primary-text)] flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl">{meta.emoji}</span>
            <span>{meta.title}</span>
          </h3>
        </div>

        {/* Score Display Box */}
        <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl p-3.5 sm:p-4 space-y-1.5">
          <div className="text-[10px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider">
            Final Score
          </div>
          <div className="font-mono text-4xl sm:text-5xl font-black text-[var(--primary-text)] tracking-tight">
            {score}
          </div>

          <div className="pt-2 border-t border-[var(--line)]/20 flex items-center justify-between text-xs font-bold px-1">
            <span className="text-[var(--secondary-text)] flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Best Record:
            </span>
            <span className="font-mono font-black text-[var(--primary-text)]">
              {highScore} pts
            </span>
          </div>
        </div>

        {/* Additional Game Stats breakdown */}
        {Object.keys(extraStats).length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-left">
            {Object.entries(extraStats).map(([key, val]) => (
              <div
                key={key}
                className="bg-[var(--surface-muted)] border border-[var(--line)]/30 rounded-xl p-2 px-2.5"
              >
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--secondary-text)]">
                  {key}
                </div>
                <div className="font-mono font-black text-xs sm:text-sm text-[var(--primary-text)] truncate">
                  {val}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Play Again */}
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-black text-sm hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Play Again</span>
          </button>

          <div className="flex gap-2">
            {/* Share / Challenge */}
            <button
              type="button"
              onClick={handleShareToChat}
              className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Share challenge or score in chat"
            >
              {selectedUser ? <Send className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{selectedUser ? "Send to Chat" : "Share Score"}</span>
            </button>

            {/* Back to Games */}
            <button
              type="button"
              onClick={onBackToMenu || (() => setActiveGame(null))}
              className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
