import { create } from "zustand";
import toast from "react-hot-toast";

const STORAGE_KEY_SCORES = "chatly_arcade_highscores";
const STORAGE_KEY_STATS = "chatly_arcade_stats";
const STORAGE_KEY_MATCHES = "chatly_arcade_matches";
const STORAGE_KEY_SOUND = "chatly_arcade_sound";

const getInitialHighScores = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SCORES);
    return saved ? JSON.parse(saved) : { flappy: 0, snake: 0 };
  } catch {
    return { flappy: 0, snake: 0 };
  }
};

const getInitialStats = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    return saved
      ? JSON.parse(saved)
      : {
          flappy: { gamesPlayed: 0, bestScore: 0, totalScore: 0 },
          snake: { gamesPlayed: 0, bestScore: 0, totalApples: 0 },
        };
  } catch {
    return {
      flappy: { gamesPlayed: 0, bestScore: 0, totalScore: 0 },
      snake: { gamesPlayed: 0, bestScore: 0, totalApples: 0 },
    };
  }
};

const getInitialMatches = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MATCHES);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getInitialSound = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    return saved !== null ? saved === "true" : true;
  } catch {
    return true;
  }
};

export const GAME_METADATA = {
  flappy: {
    id: "flappy",
    title: "Flappy Bird",
    emoji: "🐦",
    tagline: "Tap to flap, dodge pipes & fly high!",
    badge: "Arcade Classic",
    color: "#f97316", // orange
    themeGradient: "from-amber-500/20 to-orange-500/10",
    borderAccent: "border-orange-500/40 hover:border-orange-500",
    scoreUnit: "pts",
  },
  snake: {
    id: "snake",
    title: "Snake",
    emoji: "🐍",
    tagline: "Eat apples, grow long & don't hit walls!",
    badge: "Retro Hit",
    color: "#22c55e", // green
    themeGradient: "from-green-500/20 to-emerald-500/10",
    borderAccent: "border-green-500/40 hover:border-green-500",
    scoreUnit: "pts",
  },
};

export const useGamesStore = create((set, get) => ({
  isGamesModalOpen: false,
  activeGame: null, // null (selector) | "flappy" | "snake"
  soundEnabled: getInitialSound(),
  highScores: getInitialHighScores(),
  gameStats: getInitialStats(),
  recentMatches: getInitialMatches(),
  activeTab: "games", // "games" | "scores" | "challenges"

  // Open modal with optional specific game
  openGames: (gameId = null) => {
    set({
      isGamesModalOpen: true,
      activeGame: gameId,
    });
  },

  // Close modal
  closeGames: () => {
    set({
      isGamesModalOpen: false,
      activeGame: null,
    });
  },

  // Navigate between games inside arcade
  setActiveGame: (gameId) => {
    set({ activeGame: gameId });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(next));
    } catch (e) {
      console.error(e);
    }
    set({ soundEnabled: next });
    toast.success(next ? "Sound Effects Enabled 🔊" : "Sound Muted 🔇", {
      id: "arcade-sound-toast",
      duration: 1500,
    });
  },

  // Record a score at game-over
  recordGameScore: (gameId, score, extraStats = {}) => {
    const state = get();
    const currentHighScores = { ...state.highScores };
    const currentStats = { ...state.gameStats };
    const previousHighScore = currentHighScores[gameId] || 0;
    const isNewHighScore = score > previousHighScore;

    if (isNewHighScore) {
      currentHighScores[gameId] = score;
      try {
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(currentHighScores));
      } catch (e) {
        console.error(e);
      }
    }

    // Update stats
    const gameStat = currentStats[gameId] || { gamesPlayed: 0, bestScore: 0, totalScore: 0 };
    const updatedGameStat = {
      ...gameStat,
      gamesPlayed: (gameStat.gamesPlayed || 0) + 1,
      bestScore: Math.max(gameStat.bestScore || 0, score),
      totalScore: (gameStat.totalScore || 0) + score,
      ...extraStats,
    };

    if (gameId === "snake") {
      updatedGameStat.totalApples = (gameStat.totalApples || 0) + (extraStats.apples || 0);
    }

    currentStats[gameId] = updatedGameStat;
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(currentStats));
    } catch (e) {
      console.error(e);
    }

    // Record Match History
    const matchRecord = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gameId,
      score,
      isNewHighScore,
      extraStats,
      timestamp: new Date().toISOString(),
    };
    const updatedMatches = [matchRecord, ...state.recentMatches.slice(0, 19)];
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(updatedMatches));
    } catch (e) {
      console.error(e);
    }

    set({
      highScores: currentHighScores,
      gameStats: currentStats,
      recentMatches: updatedMatches,
    });

    return {
      isNewHighScore,
      previousHighScore,
      highScore: isNewHighScore ? score : previousHighScore,
    };
  },

  // Helper to format challenge message for chat
  generateChallengeText: (gameId, score) => {
    const meta = GAME_METADATA[gameId] || { title: "Arcade Game", emoji: "🎮" };
    return `🎮 Chatly Arcade Challenge! I just scored ${score} in ${meta.emoji} ${meta.title}! Think you can beat my score? 🔥`;
  },
}));
