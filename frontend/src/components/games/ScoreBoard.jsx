import React, { useState } from "react";
import { Trophy, History, Swords, Share2, Send } from "lucide-react";
import { useGamesStore, GAME_METADATA } from "../../store/useGamesStore";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

export const ScoreBoard = () => {
  const { highScores, gameStats, recentMatches, openGames, generateChallengeText } = useGamesStore();
  const { selectedUser, sendMessage } = useChatStore();
  const [activeTab, setActiveTab] = useState("scores"); // "scores" | "history"

  const flappyStats = gameStats.flappy || { gamesPlayed: 0, bestScore: 0, totalScore: 0 };
  const snakeStats = gameStats.snake || { gamesPlayed: 0, bestScore: 0, totalApples: 0 };
  const totalGamesPlayed = (flappyStats.gamesPlayed || 0) + (snakeStats.gamesPlayed || 0);
  const totalPoints = (flappyStats.totalScore || 0) + (snakeStats.bestScore || 0);

  const handleSendChallenge = async (gameId = "flappy") => {
    const score = highScores[gameId] || 0;
    const text = generateChallengeText(gameId, score);
    if (selectedUser) {
      try {
        await sendMessage({ text });
        toast.success(`Challenge sent to ${selectedUser.fullName}! 🎮`);
      } catch (e) {
        console.error(e);
        navigator.clipboard.writeText(text);
        toast.success("Challenge copied to clipboard! 📋");
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Challenge copied to clipboard! Share it in any chat 📋");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[var(--surface-muted)] rounded-2xl border-2 border-[var(--line)] max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab("scores")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "scores"
              ? "bg-[var(--accent)] text-black border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
              : "text-[var(--secondary-text)] hover:text-[var(--primary-text)] border-2 border-transparent"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Trophies</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "history"
              ? "bg-[var(--accent)] text-black border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
              : "text-[var(--secondary-text)] hover:text-[var(--primary-text)] border-2 border-transparent"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* Overview Stat Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
          <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
            Games Played
          </span>
          <span className="font-mono text-xl font-black text-[var(--primary-text)]">
            {totalGamesPlayed}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
          <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
            Best Flap Record
          </span>
          <span className="font-mono text-xl font-black text-amber-500">
            {highScores.flappy || 0} pts
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
          <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
            Best Snake Record
          </span>
          <span className="font-mono text-xl font-black text-emerald-500">
            {highScores.snake || 0} pts
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
          <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
            Apples Eaten
          </span>
          <span className="font-mono text-xl font-black text-red-500">
            {snakeStats.totalApples || 0} 🍎
          </span>
        </div>
      </div>

      {/* Tab 1: High Scores & Challenge Friends */}
      {activeTab === "scores" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {Object.entries(GAME_METADATA).map(([key, meta]) => {
              const score = highScores[key] || 0;
              const stats = gameStats[key] || {};
              return (
                <div
                  key={key}
                  className="p-5 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] shadow-[4px_4px_0px_0px_var(--line)] space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{meta.emoji}</span>
                      <div>
                        <h4 className="font-black text-base text-[var(--primary-text)] leading-tight">
                          {meta.title}
                        </h4>
                        <span className="text-xs font-bold text-[var(--secondary-text)]">
                          {stats.gamesPlayed || 0} rounds played
                        </span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)]/30 rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
                      All-Time High Score
                    </span>
                    <span className="font-mono text-3xl font-black text-[var(--primary-text)]">
                      {score} <span className="text-sm font-semibold text-[var(--secondary-text)]">pts</span>
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => openGames(key)}
                      className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      Play {meta.title}
                    </button>
                    <button
                      onClick={() => handleSendChallenge(key)}
                      className="px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] hover:bg-[var(--surface)] transition-all cursor-pointer flex items-center gap-1.5"
                      title={`Challenge Friends in ${meta.title}`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold hidden sm:inline">Share</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social / Multiplayer-ready banner */}
          <div className="p-5 rounded-3xl border-2 border-[var(--line)] bg-gradient-to-r from-[var(--accent)]/20 via-[var(--surface)] to-[var(--accent)]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_var(--line)]">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center shrink-0">
                <Swords className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[var(--primary-text)]">
                  Challenge Friends in Real-Time
                </h4>
                <p className="text-xs text-[var(--secondary-text)] font-medium">
                  Challenge any chat contact to beat your scores with instant high-score cards.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSendChallenge("flappy")}
                className="px-3.5 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>🐦 Bird</span>
              </button>
              <button
                onClick={() => handleSendChallenge("snake")}
                className="px-3.5 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>🐍 Snake</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Match History */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {recentMatches.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-[var(--surface-muted)] rounded-2xl border-2 border-[var(--line)]">
              <History className="w-8 h-8 text-[var(--secondary-text)] mx-auto opacity-50" />
              <h5 className="font-extrabold text-sm text-[var(--primary-text)]">No match records yet</h5>
              <p className="text-xs text-[var(--secondary-text)]">
                Play a round of Flappy Bird or Snake to record your scores and medals here!
              </p>
            </div>
          ) : (
            recentMatches.map((match) => {
              const meta = GAME_METADATA[match.gameId] || { title: "Game", emoji: "🎮" };
              const timeStr = new Date(match.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={match.id}
                  className="p-3.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_var(--line)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[var(--primary-text)]">
                          {meta.title}
                        </span>
                        {match.isNewHighScore && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 border border-amber-500/40">
                            NEW BEST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--secondary-text)] font-semibold">
                        {timeStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-[var(--primary-text)]">
                      {match.score} pts
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
