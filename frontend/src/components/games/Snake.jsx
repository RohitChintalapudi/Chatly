import React, { useState, useEffect, useRef, useCallback } from "react";
import { GameHeader } from "./GameHeader";
import { GameOverScreen } from "./GameOverScreen";
import { useGamesStore } from "../../store/useGamesStore";
import {
  playEatSound,
  playBonusEatSound,
  playMoveSound,
  playGameOverSound,
} from "../../utils/soundEffects";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play } from "lucide-react";

const GRID_SIZE = 20;
const CELL_COUNT = 20; // 20x20 grid = 400x400 canvas

export const Snake = ({ onBack }) => {
  const canvasRef = useRef(null);
  const { highScores, recordGameScore, soundEnabled } = useGamesStore();
  const currentHighScore = highScores.snake || 0;

  const [gameState, setGameState] = useState("READY"); // "READY" | "PLAYING" | "PAUSED" | "GAMEOVER"
  const [score, setScore] = useState(0);
  const [applesEaten, setApplesEaten] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lastStats, setLastStats] = useState({});

  const stateRef = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ],
    direction: { x: 0, y: -1 }, // moving UP initially
    nextDirection: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    bonusFood: null, // { x, y, expireTime }
    particles: [],
    score: 0,
    apples: 0,
    speed: 130, // ms per tick
    lastTickTime: 0,
  });

  const spawnFood = useCallback((snake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      };
      const onSnake = snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const spawnBonusFood = useCallback((snake, food) => {
    let bonus;
    while (true) {
      bonus = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
        expiresAt: Date.now() + 8000, // 8 seconds
      };
      const onSnake = snake.some((seg) => seg.x === bonus.x && seg.y === bonus.y);
      const onFood = food.x === bonus.x && food.y === bonus.y;
      if (!onSnake && !onFood) break;
    }
    return bonus;
  }, []);

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    s.snake = initialSnake;
    s.direction = { x: 0, y: -1 };
    s.nextDirection = { x: 0, y: -1 };
    s.food = spawnFood(initialSnake);
    s.bonusFood = null;
    s.particles = [];
    s.score = 0;
    s.apples = 0;
    s.speed = 130;
    s.lastTickTime = Date.now();

    setScore(0);
    setApplesEaten(0);
    setIsNewRecord(false);
    setGameState("PLAYING");
  }, [spawnFood]);

  const triggerGameOver = useCallback(() => {
    const s = stateRef.current;
    playGameOverSound(soundEnabled);

    // Spawn explosion particles
    const head = s.snake[0];
    for (let i = 0; i < 20; i++) {
      s.particles.push({
        x: head.x * GRID_SIZE + 10,
        y: head.y * GRID_SIZE + 10,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: "#22c55e",
        size: Math.random() * 5 + 3,
        life: 1,
      });
    }

    const { isNewHighScore } = recordGameScore("snake", s.score, {
      apples: s.apples,
      length: s.snake.length,
    });
    setIsNewRecord(isNewHighScore);
    setLastStats({
      "Apples Eaten": `${s.apples} 🍎`,
      "Snake Length": `${s.snake.length} segments`,
    });
    setGameState("GAMEOVER");
  }, [recordGameScore, soundEnabled]);

  // Handle direction changes safely
  const changeDirection = useCallback((dir) => {
    const s = stateRef.current;
    // Prevent 180-degree instant reversal
    if (
      (dir.x === 1 && s.direction.x === -1) ||
      (dir.x === -1 && s.direction.x === 1) ||
      (dir.y === 1 && s.direction.y === -1) ||
      (dir.y === -1 && s.direction.y === 1)
    ) {
      return;
    }
    s.nextDirection = dir;
    playMoveSound(soundEnabled);
  }, [soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === "READY" && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        resetGame();
        return;
      }
      if (e.code === "KeyP") {
        e.preventDefault();
        setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : prev === "PAUSED" ? "PLAYING" : prev));
        return;
      }
      if (e.code === "KeyR") {
        e.preventDefault();
        resetGame();
        return;
      }

      if (gameState !== "PLAYING") return;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          e.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "KeyA":
          e.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "KeyD":
          e.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, changeDirection, resetGame]);

  // Main Canvas & Game Update Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const render = () => {
      const s = stateRef.current;
      const now = Date.now();

      // Tick game state
      if (gameState === "PLAYING" && now - s.lastTickTime >= s.speed) {
        s.lastTickTime = now;
        s.direction = s.nextDirection;

        const head = s.snake[0];
        const newHead = {
          x: head.x + s.direction.x,
          y: head.y + s.direction.y,
        };

        // Wall collisions
        if (
          newHead.x < 0 ||
          newHead.x >= CELL_COUNT ||
          newHead.y < 0 ||
          newHead.y >= CELL_COUNT
        ) {
          triggerGameOver();
          return;
        }

        // Self collisions (check body segments)
        const hitSelf = s.snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y);
        if (hitSelf) {
          triggerGameOver();
          return;
        }

        s.snake.unshift(newHead);

        // Check Food Collision
        if (newHead.x === s.food.x && newHead.y === s.food.y) {
          playEatSound(soundEnabled);
          s.score += 10;
          s.apples += 1;
          setScore(s.score);
          setApplesEaten(s.apples);
          s.food = spawnFood(s.snake);

          // Speed up slightly as snake grows
          s.speed = Math.max(70, 130 - Math.floor(s.apples / 3) * 5);

          // Chance to spawn bonus star (1 in 4)
          if (!s.bonusFood && Math.random() < 0.28) {
            s.bonusFood = spawnBonusFood(s.snake, s.food);
          }

          // Spawn eat particles
          for (let i = 0; i < 8; i++) {
            s.particles.push({
              x: newHead.x * GRID_SIZE + 10,
              y: newHead.y * GRID_SIZE + 10,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: "#ef4444",
              size: Math.random() * 4 + 2,
              life: 1,
            });
          }
        } else if (
          s.bonusFood &&
          newHead.x === s.bonusFood.x &&
          newHead.y === s.bonusFood.y
        ) {
          playBonusEatSound(soundEnabled);
          s.score += 35;
          setScore(s.score);
          s.bonusFood = null;

          // Bonus sparkle particles
          for (let i = 0; i < 16; i++) {
            s.particles.push({
              x: newHead.x * GRID_SIZE + 10,
              y: newHead.y * GRID_SIZE + 10,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: "#eab308",
              size: Math.random() * 5 + 3,
              life: 1,
            });
          }
        } else {
          // Regular step: pop tail
          s.snake.pop();
        }

        // Expire bonus food if timed out
        if (s.bonusFood && Date.now() > s.bonusFood.expiresAt) {
          s.bonusFood = null;
        }
      }

      // ─── RENDERING ───
      const width = canvas.width;
      const height = canvas.height;
      const isDark = document.documentElement.classList.contains("dark");

      // Background
      ctx.fillStyle = isDark ? "#090d14" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Grid Pattern
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= CELL_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(width, i * GRID_SIZE);
        ctx.stroke();
      }

      // Draw Food (Apple)
      const fx = s.food.x * GRID_SIZE + 10;
      const fy = s.food.y * GRID_SIZE + 10;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(fx, fy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Apple Leaf
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.ellipse(fx + 3, fy - 7, 3, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bonus Star / Gem
      if (s.bonusFood) {
        const bx = s.bonusFood.x * GRID_SIZE + 10;
        const by = s.bonusFood.y * GRID_SIZE + 10;
        const pulse = Math.sin(Date.now() * 0.008) * 2;

        ctx.fillStyle = "#eab308";
        ctx.beginPath();
        ctx.arc(bx, by, 8 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("★", bx, by + 3.5);
      }

      // Draw Snake Body
      s.snake.forEach((seg, index) => {
        const sx = seg.x * GRID_SIZE;
        const sy = seg.y * GRID_SIZE;

        if (index === 0) {
          // Head (Glowing Green/Neon)
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.roundRect(sx + 1, sy + 1, GRID_SIZE - 2, GRID_SIZE - 2, 6);
          ctx.fill();
          ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Eyes pointing in direction
          const eyeOffset = 4;
          const eyeX1 = sx + 6 + s.direction.x * eyeOffset;
          const eyeY1 = sy + 6 + s.direction.y * eyeOffset;
          const eyeX2 = sx + 14 + s.direction.x * eyeOffset;
          const eyeY2 = sy + 14 + s.direction.y * eyeOffset;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, 2.5, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, 1.2, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Body segment with gradient alpha
          const opacity = Math.max(0.4, 1 - (index / s.snake.length) * 0.5);
          ctx.fillStyle = isDark
            ? `rgba(34, 197, 94, ${opacity})`
            : `rgba(22, 163, 74, ${opacity})`;
          ctx.beginPath();
          ctx.roundRect(sx + 2, sy + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4);
          ctx.fill();
          ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, triggerGameOver, spawnFood, spawnBonusFood, soundEnabled]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full bg-[var(--surface-muted)] relative overflow-hidden select-none">
      {/* Header */}
      <GameHeader
        gameId="snake"
        score={score}
        highScore={currentHighScore}
        extraBadges={[{ label: "Apples", value: applesEaten, icon: "🍎" }]}
        isPlaying={gameState === "PLAYING"}
        isPaused={gameState === "PAUSED"}
        onPauseToggle={() =>
          setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"))
        }
        onRestart={resetGame}
        onBack={onBack}
      />

      {/* Main Game Board */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto relative">
        <div className="relative border-4 border-[var(--line)] rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_var(--line)] bg-[var(--surface)]">
          <canvas
            ref={canvasRef}
            width={CELL_COUNT * GRID_SIZE}
            height={CELL_COUNT * GRID_SIZE}
            className="block aspect-square w-full max-w-[340px] sm:max-w-[380px] h-auto max-h-[calc(100vh-270px)]"
          />

          {/* READY State Overlay */}
          {gameState === "READY" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center text-white space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-green-500 border-2 border-[var(--line)] flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_var(--line)] animate-bounce">
                🐍
              </div>
              <div>
                <h3 className="text-2xl font-black">Snake</h3>
                <p className="text-xs text-white/80 mt-1 max-w-[200px]">
                  Use Arrow Keys or WASD to slither, eat apples & grow!
                </p>
              </div>
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-black text-xs sm:text-sm hover:shadow-[3px_3px_0px_0px_var(--line)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current stroke-[2]" />
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
        </div>

        {/* Mobile Virtual D-Pad */}
        {gameState !== "GAMEOVER" && (
          <div className="w-full max-w-[240px] mt-3 flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => changeDirection({ x: 0, y: -1 })}
              className="w-12 h-11 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-base active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
              aria-label="Up"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => changeDirection({ x: -1, y: 0 })}
                className="w-12 h-11 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-base active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
                aria-label="Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => changeDirection({ x: 0, y: 1 })}
                className="w-12 h-11 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-base active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
                aria-label="Down"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => changeDirection({ x: 1, y: 0 })}
                className="w-12 h-11 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black text-base active:scale-95 shadow-[2px_2px_0px_0px_var(--line)] flex items-center justify-center cursor-pointer"
                aria-label="Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GAME OVER Overlay (Root Level) */}
      {gameState === "GAMEOVER" && (
        <GameOverScreen
          gameId="snake"
          score={score}
          isNewHighScore={isNewRecord}
          highScore={Math.max(currentHighScore, score)}
          extraStats={lastStats}
          onPlayAgain={resetGame}
          onBackToMenu={onBack}
        />
      )}
    </div>
  );
};
