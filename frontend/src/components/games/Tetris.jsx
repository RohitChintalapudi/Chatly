import React, { useState, useEffect, useRef, useCallback } from "react";
import { GameHeader } from "./GameHeader";
import { GameOverScreen } from "./GameOverScreen";
import { useGamesStore } from "../../store/useGamesStore";
import {
  playRotateSound,
  playMoveSound,
  playLineClearSound,
  playGameOverSound,
} from "../../utils/soundEffects";
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, ArrowDownToLine, RefreshCw, Play } from "lucide-react";

// Standard Tetris constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const SHAPES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#06b6d4", // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#3b82f6", // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f97316", // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#eab308", // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#22c55e", // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a855f7", // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#ef4444", // Red
  },
};

const PIECE_TYPES = Object.keys(SHAPES);

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const getRandomPiece = () => {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return {
    type,
    matrix: SHAPES[type].shape,
    color: SHAPES[type].color,
    x: Math.floor(COLS / 2) - Math.floor(SHAPES[type].shape[0].length / 2),
    y: 0,
  };
};

const rotateMatrix = (matrix) => {
  const N = matrix.length;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - 1 - j][i])
  );
  return result;
};

export const Tetris = ({ onBack }) => {
  const canvasRef = useRef(null);
  const { highScores, recordGameScore, soundEnabled } = useGamesStore();
  const currentHighScore = highScores.tetris || 0;

  const [gameState, setGameState] = useState("READY"); // "READY" | "PLAYING" | "PAUSED" | "GAMEOVER"
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lastStats, setLastStats] = useState({});

  const stateRef = useRef({
    grid: createEmptyGrid(),
    currentPiece: null,
    nextPiece: getRandomPiece(),
    holdPiece: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    dropInterval: 800,
    lastDropTime: 0,
    clearingRows: [],
  });

  const checkCollision = useCallback((piece, grid, offsetX = 0, offsetY = 0) => {
    if (!piece) return true;
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c] !== 0) {
          const newX = piece.x + c + offsetX;
          const newY = piece.y + r + offsetY;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          if (newY >= 0 && grid[newY] && grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Merge piece into grid
  const lockPiece = useCallback(() => {
    const s = stateRef.current;
    const { currentPiece, grid } = s;
    if (!currentPiece) return;

    for (let r = 0; r < currentPiece.matrix.length; r++) {
      for (let c = 0; c < currentPiece.matrix[r].length; c++) {
        if (currentPiece.matrix[r][c] !== 0) {
          const gy = currentPiece.y + r;
          const gx = currentPiece.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            grid[gy][gx] = currentPiece.color;
          }
        }
      }
    }

    // Check for completed rows
    let clearedCount = 0;
    const newGrid = [];

    for (let r = 0; r < ROWS; r++) {
      const isComplete = grid[r].every((cell) => cell !== 0);
      if (isComplete) {
        clearedCount++;
      } else {
        newGrid.push(grid[r]);
      }
    }

    if (clearedCount > 0) {
      playLineClearSound(clearedCount === 4, soundEnabled);
      while (newGrid.length < ROWS) {
        newGrid.unshift(Array(COLS).fill(0));
      }
      s.grid = newGrid;

      // Score calculation
      const linePoints = [0, 100, 300, 500, 800];
      const addedScore = (linePoints[clearedCount] || 100) * s.level;
      s.score += addedScore;
      s.lines += clearedCount;
      s.level = Math.floor(s.lines / 10) + 1;
      s.dropInterval = Math.max(120, 800 - (s.level - 1) * 70);

      setScore(s.score);
      setLines(s.lines);
      setLevel(s.level);
    }

    // Spawn next piece
    s.currentPiece = s.nextPiece;
    s.nextPiece = getRandomPiece();
    s.canHold = true;

    // Game Over check
    if (checkCollision(s.currentPiece, s.grid)) {
      playGameOverSound(soundEnabled);
      const { isNewHighScore } = recordGameScore("tetris", s.score, {
        lines: s.lines,
        level: s.level,
      });
      setIsNewRecord(isNewHighScore);
      setLastStats({
        "Lines Cleared": s.lines,
        "Level Reached": s.level,
      });
      setGameState("GAMEOVER");
    }
  }, [checkCollision, recordGameScore, soundEnabled]);

  // Movement Functions
  const moveLeft = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== "PLAYING" || !s.currentPiece) return;
    if (!checkCollision(s.currentPiece, s.grid, -1, 0)) {
      s.currentPiece.x -= 1;
      playMoveSound(soundEnabled);
    }
  }, [gameState, checkCollision, soundEnabled]);

  const moveRight = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== "PLAYING" || !s.currentPiece) return;
    if (!checkCollision(s.currentPiece, s.grid, 1, 0)) {
      s.currentPiece.x += 1;
      playMoveSound(soundEnabled);
    }
  }, [gameState, checkCollision, soundEnabled]);

  const drop = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== "PLAYING" || !s.currentPiece) return;
    if (!checkCollision(s.currentPiece, s.grid, 0, 1)) {
      s.currentPiece.y += 1;
    } else {
      lockPiece();
    }
  }, [gameState, checkCollision, lockPiece]);

  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== "PLAYING" || !s.currentPiece) return;
    let droppedLines = 0;
    while (!checkCollision(s.currentPiece, s.grid, 0, 1)) {
      s.currentPiece.y += 1;
      droppedLines++;
    }
    s.score += droppedLines * 2;
    setScore(s.score);
    playRotateSound(soundEnabled);
    lockPiece();
  }, [gameState, checkCollision, lockPiece, soundEnabled]);

  const rotate = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== "PLAYING" || !s.currentPiece) return;
    const rotated = rotateMatrix(s.currentPiece.matrix);
    const testPiece = { ...s.currentPiece, matrix: rotated };

    // Basic wall kick tests
    if (!checkCollision(testPiece, s.grid)) {
      s.currentPiece.matrix = rotated;
      playRotateSound(soundEnabled);
    } else if (!checkCollision(testPiece, s.grid, 1, 0)) {
      s.currentPiece.x += 1;
      s.currentPiece.matrix = rotated;
      playRotateSound(soundEnabled);
    } else if (!checkCollision(testPiece, s.grid, -1, 0)) {
      s.currentPiece.x -= 1;
      s.currentPiece.matrix = rotated;
      playRotateSound(soundEnabled);
    }
  }, [gameState, checkCollision, soundEnabled]);

  const hold = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== "PLAYING" || !s.currentPiece || !s.canHold) return;

    if (!s.holdPiece) {
      s.holdPiece = {
        type: s.currentPiece.type,
        matrix: SHAPES[s.currentPiece.type].shape,
        color: SHAPES[s.currentPiece.type].color,
      };
      s.currentPiece = s.nextPiece;
      s.nextPiece = getRandomPiece();
    } else {
      const temp = s.holdPiece;
      s.holdPiece = {
        type: s.currentPiece.type,
        matrix: SHAPES[s.currentPiece.type].shape,
        color: SHAPES[s.currentPiece.type].color,
      };
      s.currentPiece = {
        type: temp.type,
        matrix: temp.matrix,
        color: temp.color,
        x: Math.floor(COLS / 2) - Math.floor(temp.matrix[0].length / 2),
        y: 0,
      };
    }
    s.canHold = false;
    playMoveSound(soundEnabled);
  }, [gameState, soundEnabled]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.grid = createEmptyGrid();
    s.currentPiece = getRandomPiece();
    s.nextPiece = getRandomPiece();
    s.holdPiece = null;
    s.canHold = true;
    s.score = 0;
    s.lines = 0;
    s.level = 1;
    s.dropInterval = 800;
    s.lastDropTime = Date.now();
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsNewRecord(false);
    setGameState("PLAYING");
  }, []);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === "READY" && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        startGame();
        return;
      }
      if (e.code === "KeyP") {
        e.preventDefault();
        setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : prev === "PAUSED" ? "PLAYING" : prev));
        return;
      }
      if (e.code === "KeyR") {
        e.preventDefault();
        startGame();
        return;
      }

      if (gameState !== "PLAYING") return;

      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
        case "KeyD":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          drop();
          break;
        case "ArrowUp":
        case "KeyW":
        case "KeyX":
          e.preventDefault();
          rotate();
          break;
        case "Space":
          e.preventDefault();
          hardDrop();
          break;
        case "KeyC":
        case "ShiftLeft":
        case "ShiftRight":
          e.preventDefault();
          hold();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, moveLeft, moveRight, drop, rotate, hardDrop, hold, startGame]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const loop = (timestamp) => {
      const s = stateRef.current;

      // Auto Drop Timer
      if (gameState === "PLAYING") {
        const now = Date.now();
        if (now - s.lastDropTime > s.dropInterval) {
          drop();
          s.lastDropTime = now;
        }
      }

      // Render Screen
      const width = canvas.width;
      const height = canvas.height;
      const isDark = document.documentElement.classList.contains("dark");

      ctx.fillStyle = isDark ? "#0c1017" : "#f1f5f9";
      ctx.fillRect(0, 0, width, height);

      // Grid background lines
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)";
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, height);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(width, r * BLOCK_SIZE);
        ctx.stroke();
      }

      // Draw Locked Grid Blocks
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = s.grid[r][c];
          if (color !== 0) {
            ctx.fillStyle = color;
            ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        }
      }

      // Draw Ghost Piece (Drop Projection)
      if (s.currentPiece && gameState === "PLAYING") {
        let ghostY = 0;
        while (!checkCollision(s.currentPiece, s.grid, 0, ghostY + 1)) {
          ghostY++;
        }
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";
        for (let r = 0; r < s.currentPiece.matrix.length; r++) {
          for (let c = 0; c < s.currentPiece.matrix[r].length; c++) {
            if (s.currentPiece.matrix[r][c] !== 0) {
              const gx = (s.currentPiece.x + c) * BLOCK_SIZE;
              const gy = (s.currentPiece.y + r + ghostY) * BLOCK_SIZE;
              ctx.fillRect(gx + 1, gy + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
              ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.2)";
              ctx.strokeRect(gx + 1, gy + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            }
          }
        }
      }

      // Draw Active Piece
      if (s.currentPiece) {
        ctx.fillStyle = s.currentPiece.color;
        for (let r = 0; r < s.currentPiece.matrix.length; r++) {
          for (let c = 0; c < s.currentPiece.matrix[r].length; c++) {
            if (s.currentPiece.matrix[r][c] !== 0) {
              const px = (s.currentPiece.x + c) * BLOCK_SIZE;
              const py = (s.currentPiece.y + r) * BLOCK_SIZE;
              ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
              ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
              ctx.lineWidth = 1.5;
              ctx.strokeRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, drop, checkCollision]);

  // Mini Preview Render Helper for Hold and Next pieces
  const renderMiniPiece = (piece) => {
    if (!piece) return <div className="text-xs text-[var(--secondary-text)] italic">None</div>;
    return (
      <div className="flex flex-col items-center justify-center p-1">
        {piece.matrix.map((row, rIdx) => (
          <div key={rIdx} className="flex">
            {row.map((val, cIdx) => (
              <div
                key={cIdx}
                className="w-3.5 h-3.5 m-[1px] rounded-sm"
                style={{
                  backgroundColor: val !== 0 ? piece.color : "transparent",
                  border: val !== 0 ? "1px solid var(--line)" : "none",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--surface-muted)] relative overflow-hidden select-none">
      {/* Header */}
      <GameHeader
        gameId="tetris"
        score={score}
        highScore={currentHighScore}
        extraBadges={[
          { label: "Lines", value: lines },
          { label: "Level", value: level },
        ]}
        isPlaying={gameState === "PLAYING"}
        isPaused={gameState === "PAUSED"}
        onPauseToggle={() =>
          setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"))
        }
        onRestart={startGame}
        onBack={onBack}
      />

      {/* Main Game Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="flex items-start justify-center gap-3 sm:gap-4 max-w-full">
          {/* Left Sidebar: Hold Piece & Stats */}
          <div className="hidden xs:flex flex-col gap-3 w-20 sm:w-24">
            <div className="p-2.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
              <span className="text-[10px] font-black uppercase text-[var(--secondary-text)] block mb-1">
                HOLD (C)
              </span>
              <div className="h-12 flex items-center justify-center">
                {renderMiniPiece(stateRef.current.holdPiece)}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
              <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase block">
                Level
              </span>
              <span className="font-mono text-base font-black text-[var(--primary-text)]">
                {level}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
              <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase block">
                Lines
              </span>
              <span className="font-mono text-base font-black text-blue-500">
                {lines}
              </span>
            </div>
          </div>

          {/* Main Canvas Board */}
          <div className="relative border-4 border-[var(--line)] rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_var(--line)] bg-[var(--surface)]">
            <canvas
              ref={canvasRef}
              width={COLS * BLOCK_SIZE}
              height={ROWS * BLOCK_SIZE}
              className="block aspect-[240/480] w-full max-w-[240px] h-auto max-h-[calc(100vh-250px)]"
            />

            {/* READY State Overlay */}
            {gameState === "READY" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center text-white space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-blue-500 border-2 border-[var(--line)] flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_var(--line)] animate-bounce">
                  🧱
                </div>
                <div>
                  <h3 className="text-xl font-black">Tetris</h3>
                  <p className="text-xs text-white/80 mt-1 max-w-[180px]">
                    Use arrow keys to move, rotate, and drop blocks!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-black text-xs hover:shadow-[3px_3px_0px_0px_var(--line)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current stroke-[2]" />
                  <span>START GAME</span>
                </button>
              </div>
            )}

            {/* PAUSED Overlay */}
            {gameState === "PAUSED" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                <span className="text-2xl font-black tracking-widest uppercase">PAUSED</span>
                <button
                  type="button"
                  onClick={() => setGameState("PLAYING")}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-black font-extrabold text-xs border-2 border-[var(--line)] cursor-pointer"
                >
                  Resume (P)
                </button>
              </div>
            )}

            {/* GAME OVER Overlay */}
            {gameState === "GAMEOVER" && (
              <GameOverScreen
                gameId="tetris"
                score={score}
                isNewHighScore={isNewRecord}
                highScore={Math.max(currentHighScore, score)}
                extraStats={lastStats}
                onPlayAgain={startGame}
                onBackToMenu={onBack}
              />
            )}
          </div>

          {/* Right Sidebar: Next Piece Preview */}
          <div className="hidden xs:flex flex-col gap-3 w-20 sm:w-24">
            <div className="p-2.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-center shadow-[2px_2px_0px_0px_var(--line)]">
              <span className="text-[10px] font-black uppercase text-[var(--secondary-text)] block mb-1">
                NEXT
              </span>
              <div className="h-12 flex items-center justify-center">
                {renderMiniPiece(stateRef.current.nextPiece)}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile On-Screen Touch Controls */}
        <div className="w-full max-w-sm mt-3 pt-1 flex flex-col gap-1.5 px-2">
          {/* Top row: Hold, Rotate, Hard Drop */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={hold}
              className="flex-1 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-xs active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hold</span>
            </button>
            <button
              type="button"
              onClick={rotate}
              className="flex-1 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-xs active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={hardDrop}
              className="flex-1 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-xs active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Drop</span>
            </button>
          </div>

          {/* Bottom row: Left, Soft Drop, Right */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={moveLeft}
              className="flex-1 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-sm active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={drop}
              className="flex-1 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-sm active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={moveRight}
              className="flex-1 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-sm active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
