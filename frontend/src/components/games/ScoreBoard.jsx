import React, { useState } from "react";
import { Trophy, Flame, Swords, History, Zap, CheckCircle2, Share2, Send } from "lucide-react";
import { useGamesStore, GAME_METADATA } from "../../store/useGamesStore";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

export const ScoreBoard = () => {
  const { highScores, gameStats, recentMatches, openGames, generateChallengeText } = useGamesStore();
  const { selectedUser, sendMessage } = useChatStore();
  const [activeTab, setActiveTab] = useState("scores"); // "scores" | "history" | "challenges"

  const totalGamesPlayed =
    (gameStats.flappy?.gamesPlayed || 0) +
    (gameStats.tetris?.gamesPlayed || 0) +
    (gameStats.snake?.gamesPlayed || 0);

  const totalPoints =
    (gameStats.flappy?.totalScore || 0) +
    (gameStats.tetris?.totalScore || 0) +
    (gameStats.snake?.totalScore || 0);

  const dailyQuests = [
    {
      id: "q1",
      gameId: "flappy",
      title: "Sky High",
      desc: "Score 10+ points in Flappy Bird",
      target: 10,
      current: highScores.flappy || 0,
      reward: "⭐ Aviator Badge",
      completed: (highScores.flappy || 0) >= 10,
    },
    {
      id: "q2",
      gameId: "tetris",
      title: "Line Cleaner",
      desc: "Clear 15+ lines in Tetris",
      target: 15,
      current: gameStats.tetris?.totalLines || 0,
      reward: "⭐ Matrix Master",
      completed: (gameStats.tetris?.totalLines || 0) >= 15,
    },
    {
      id: "q3",
      gameId: "snake",
      title: "Apple Feast",
      desc: "Eat 20+ apples in Snake",
      target: 20,
      current: gameStats.snake?.totalApples || 0,
      reward: "⭐ Python King",
      completed: (gameStats.snake?.totalApples || 0) >= 20,
    },
  ];

  const handleSendChallenge = async (gameId) => {
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
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[var(--surface-muted)] rounded-2xl border-2 border-[var(--line)] max-w-md mx-auto">
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
          onClick={() => setActiveTab("challenges")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "challenges"
              ? "bg-[var(--accent)] text-black border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
              : "text-[var(--secondary-text)] hover:text-[var(--primary-text)] border-2 border-transparent"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Daily Quests</span>
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
            Total Points
          </span>
          <span className="font-mono text-xl font-black text-[var(--primary-text)]">
            {totalPoints.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
          <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
            Tetris Lines
          </span>
          <span className="font-mono text-xl font-black text-blue-500">
            {gameStats.tetris?.totalLines || 0}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
          <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
            Snake Apples
          </span>
          <span className="font-mono text-xl font-black text-green-500">
            {gameStats.snake?.totalApples || 0}
          </span>
        </div>
      </div>

      {/* Tab 1: High Scores & Challenge Friends */}
      {activeTab === "scores" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {Object.entries(GAME_METADATA).map(([key, meta]) => {
              const score = highScores[key] || 0;
              const stats = gameStats[key] || {};
              return (
                <div
                  key={key}
                  className="p-5 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] shadow-[4px_4px_0px_0px_var(--line)] space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{meta.emoji}</span>
                      <div>
                        <h4 className="font-black text-sm text-[var(--primary-text)] leading-tight">
                          {meta.title}
                        </h4>
                        <span className="text-[10px] font-bold text-[var(--secondary-text)]">
                          {stats.gamesPlayed || 0} matches
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)]/30 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block">
                      Best Record
                    </span>
                    <span className="font-mono text-2xl font-black text-[var(--primary-text)]">
                      {score} <span className="text-xs font-semibold text-[var(--secondary-text)]">pts</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openGames(key)}
                      className="flex-1 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleSendChallenge(key)}
                      className="p-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                      title="Challenge Friend"
                    >
                      <Share2 className="w-4 h-4" />
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
                  Challenge any chat contact to beat your arcade score with instant high-score tracking.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSendChallenge("flappy")}
              className="px-5 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-xs hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Challenge</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Quests */}
      {activeTab === "challenges" && (
        <div className="space-y-3">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] transition-all flex items-center justify-between gap-4 shadow-[3px_3px_0px_0px_var(--line)] ${
                quest.completed ? "bg-green-500/5" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border-2 border-[var(--line)] flex items-center justify-center text-lg shrink-0 ${
                    quest.completed ? "bg-green-500 text-white" : "bg-[var(--surface-muted)]"
                  }`}
                >
                  {quest.completed ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-sm text-[var(--primary-text)] truncate">
                      {quest.title}
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--line)]/20 text-[var(--secondary-text)]">
                      {quest.reward}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--secondary-text)] font-medium">{quest.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-mono font-black text-[var(--primary-text)]">
                    {Math.min(quest.current, quest.target)} / {quest.target}
                  </span>
                  <div className="w-24 h-2 rounded-full bg-[var(--surface-muted)] border border-[var(--line)]/30 overflow-hidden mt-1">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((quest.current / quest.target) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => openGames(quest.gameId)}
                  className={`px-3 py-1.5 rounded-xl border-2 border-[var(--line)] text-xs font-black transition-all cursor-pointer ${
                    quest.completed
                      ? "bg-green-500/20 text-green-700 border-green-600 cursor-default"
                      : "bg-[var(--accent)] text-black hover:shadow-[2px_2px_0px_0px_var(--line)]"
                  }`}
                >
                  {quest.completed ? "Completed" : "Play"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Match History */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {recentMatches.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-[var(--surface-muted)] rounded-2xl border-2 border-[var(--line)]">
              <History className="w-8 h-8 text-[var(--secondary-text)] mx-auto opacity-50" />
              <h5 className="font-extrabold text-sm text-[var(--primary-text)]">No matches yet</h5>
              <p className="text-xs text-[var(--secondary-text)]">
                Play a round of Flappy Bird, Tetris, or Snake to record your scores here!
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
