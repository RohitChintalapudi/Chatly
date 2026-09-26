import React, { useRef, useEffect, useState, useCallback } from "react";
import { GameHeader } from "./GameHeader";
import { GameOverScreen } from "./GameOverScreen";
import { useGamesStore } from "../../store/useGamesStore";
import { playJumpSound, playScoreSound, playGameOverSound } from "../../utils/soundEffects";
import { Play, Sparkles, Sun, Moon, Flame } from "lucide-react";

export const FlappyBird = ({ onBack }) => {
  const canvasRef = useRef(null);
  const { highScores, recordGameScore, soundEnabled } = useGamesStore();
  const currentHighScore = highScores.flappy || 0;

  // Game state
  const [gameState, setGameState] = useState("READY"); // "READY" | "PLAYING" | "PAUSED" | "GAMEOVER"
  const [score, setScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lastStats, setLastStats] = useState({});
  const [medal, setMedal] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState("day"); // "day" | "sunset" | "night"

  // Game loop variables stored in refs to avoid closure staleness
  const gameRef = useRef({
    bird: { x: 85, y: 220, vy: 0, radius: 16, angle: 0, flapFrame: 0, trail: [] },
    pipes: [],
    particles: [],
    floatingTexts: [],
    clouds: [
      { x: 40, y: 50, speed: 0.4, size: 45 },
      { x: 190, y: 95, speed: 0.25, size: 65 },
      { x: 340, y: 40, speed: 0.5, size: 55 },
    ],
    score: 0,
    passedPipeIds: new Set(),
    pipeTimer: 0,
    gravity: 0.36,
    jumpForce: -6.6,
  });

  const getMedal = (pts) => {
    if (pts >= 100) return { name: "Diamond", emoji: "💎", color: "#38bdf8" };
    if (pts >= 50) return { name: "Gold", emoji: "🥇", color: "#eab308" };
    if (pts >= 25) return { name: "Silver", emoji: "🥈", color: "#94a3b8" };
    if (pts >= 10) return { name: "Bronze", emoji: "🥉", color: "#d97706" };
    return null;
  };

  const jump = useCallback(() => {
    if (gameState === "READY") {
      setGameState("PLAYING");
      gameRef.current.bird.vy = gameRef.current.jumpForce;
      playJumpSound(soundEnabled);
      return;
    }
    if (gameState === "PLAYING") {
      gameRef.current.bird.vy = gameRef.current.jumpForce;
      playJumpSound(soundEnabled);
    }
  }, [gameState, soundEnabled]);

  // Reset game
  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.bird = { x: 85, y: 220, vy: 0, radius: 16, angle: 0, flapFrame: 0, trail: [] };
    g.pipes = [];
    g.particles = [];
    g.floatingTexts = [];
    g.score = 0;
    g.passedPipeIds = new Set();
    g.pipeTimer = 0;
    setScore(0);
    setMedal(null);
    setIsNewRecord(false);
    setGameState("READY");
  }, []);

  const triggerGameOver = useCallback(() => {
    const finalScore = gameRef.current.score;
    playGameOverSound(soundEnabled);

    // Spawn bird explosion particles
    const bird = gameRef.current.bird;
    for (let i = 0; i < 28; i++) {
      gameRef.current.particles.push({
        x: bird.x,
        y: bird.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#ef4444" : "#fbbf24",
        size: Math.random() * 6 + 3,
        life: 1,
      });
    }

    const earnedMedal = getMedal(finalScore);
    setMedal(earnedMedal);

    const { isNewHighScore } = recordGameScore("flappy", finalScore, {
      distance: `${finalScore * 18}m`,
      medal: earnedMedal ? earnedMedal.name : "None",
    });
    setIsNewRecord(isNewHighScore);
    setLastStats({
      "Pipes Cleared": finalScore,
      "Flight Distance": `${finalScore * 18}m`,
      "Medal Earned": earnedMedal ? `${earnedMedal.emoji} ${earnedMedal.name}` : "Fly 10+ for 🥉",
    });
    setGameState("GAMEOVER");
  }, [recordGameScore, soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      } else if (e.code === "KeyP" && (gameState === "PLAYING" || gameState === "PAUSED")) {
        e.preventDefault();
        setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"));
      } else if (e.code === "KeyR") {
        e.preventDefault();
        resetGame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump, gameState, resetGame]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const render = (timestamp) => {
      const g = gameRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Sky Gradient based on time of day
      const isDarkTheme = document.documentElement.classList.contains("dark");
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);

      if (timeOfDay === "sunset") {
        skyGrad.addColorStop(0, "#f97316");
        skyGrad.addColorStop(0.5, "#fb923c");
        skyGrad.addColorStop(1, "#fde047");
      } else if (timeOfDay === "night" || isDarkTheme) {
        skyGrad.addColorStop(0, "#090d16");
        skyGrad.addColorStop(0.6, "#111827");
        skyGrad.addColorStop(1, "#1e293b");
      } else {
        skyGrad.addColorStop(0, "#38bdf8");
        skyGrad.addColorStop(0.6, "#7dd3fc");
        skyGrad.addColorStop(1, "#bae6fd");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Stars in Night mode
      if (timeOfDay === "night" || isDarkTheme) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        for (let i = 0; i < 20; i++) {
          const sx = (i * 47) % width;
          const sy = (i * 29) % 180;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }

      // 2. Parallax Clouds
      g.clouds.forEach((cloud) => {
        if (gameState === "PLAYING") {
          cloud.x -= cloud.speed;
          if (cloud.x < -cloud.size * 2) cloud.x = width + cloud.size;
        }
        ctx.fillStyle = isDarkTheme || timeOfDay === "night"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Ground & Skyline
      const groundHeight = 65;
      const groundY = height - groundHeight;

      // City skyline
      ctx.fillStyle = isDarkTheme || timeOfDay === "night" ? "#0f172a" : "#64748b";
      ctx.fillRect(0, groundY - 25, width, 25);
      for (let x = 0; x < width; x += 36) {
        const bHeight = 18 + ((x * 31) % 30);
        ctx.fillRect(x, groundY - 25 - bHeight, 28, bHeight);
      }

      // Ground body
      ctx.fillStyle = isDarkTheme ? "#1e293b" : "#22c55e";
      ctx.fillRect(0, groundY, width, groundHeight);

      // Neo-brutalist ground divider border
      ctx.strokeStyle = isDarkTheme ? "#ffffff" : "#000000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Grass top layer with stripes
      ctx.fillStyle = isDarkTheme ? "#334155" : "#16a34a";
      ctx.fillRect(0, groundY, width, 12);
      ctx.fillStyle = isDarkTheme ? "#475569" : "#15803d";
      for (let x = 0; x < width; x += 18) {
        ctx.fillRect(x, groundY, 9, 6);
      }

      // 4. Update & Draw Pipes
      const pipeWidth = 56;
      const pipeGap = 135;
      const pipeSpeed = 2.4;

      if (gameState === "PLAYING") {
        g.pipeTimer++;
        if (g.pipeTimer % 95 === 0) {
          const minPipeY = 65;
          const maxPipeY = groundY - pipeGap - 65;
          const topPipeHeight = Math.floor(Math.random() * (maxPipeY - minPipeY)) + minPipeY;
          g.pipes.push({
            id: Date.now() + Math.random(),
            x: width,
            topHeight: topPipeHeight,
            bottomY: topPipeHeight + pipeGap,
          });
        }

        // Move pipes
        for (let i = g.pipes.length - 1; i >= 0; i--) {
          const pipe = g.pipes[i];
          pipe.x -= pipeSpeed;

          // Score check
          if (!g.passedPipeIds.has(pipe.id) && pipe.x + pipeWidth < g.bird.x) {
            g.passedPipeIds.add(pipe.id);
            g.score += 1;
            setScore(g.score);
            playScoreSound(soundEnabled);

            // Floating +1 text
            g.floatingTexts.push({
              text: "+1",
              x: g.bird.x + 10,
              y: g.bird.y - 15,
              opacity: 1,
            });
          }

          if (pipe.x + pipeWidth < -30) {
            g.pipes.splice(i, 1);
          }
        }
      }

      // Draw Pipes
      const pipeBodyColor = isDarkTheme ? "#22c55e" : "#4ade80";
      const pipeCapColor = isDarkTheme ? "#16a34a" : "#22c55e";
      const borderLineColor = isDarkTheme ? "#ffffff" : "#000000";

      g.pipes.forEach((pipe) => {
        // Top Pipe
        ctx.fillStyle = pipeBodyColor;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeStyle = borderLineColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Top Pipe Cap
        ctx.fillStyle = pipeCapColor;
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 24, pipeWidth + 8, 24);
        ctx.strokeRect(pipe.x - 4, pipe.topHeight - 24, pipeWidth + 8, 24);

        // Bottom Pipe
        const bottomHeight = groundY - pipe.bottomY;
        ctx.fillStyle = pipeBodyColor;
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, bottomHeight);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipeWidth, bottomHeight);

        // Bottom Pipe Cap
        ctx.fillStyle = pipeCapColor;
        ctx.fillRect(pipe.x - 4, pipe.bottomY, pipeWidth + 8, 24);
        ctx.strokeRect(pipe.x - 4, pipe.bottomY, pipeWidth + 8, 24);
      });

      // 5. Update Bird Physics
      const bird = g.bird;
      if (gameState === "PLAYING") {
        bird.vy += g.gravity;
        bird.y += bird.vy;
        bird.flapFrame = (bird.flapFrame + 0.18) % 3;

        // Angle tilt
        bird.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.08));

        // Floor collision
        if (bird.y + bird.radius >= groundY) {
          bird.y = groundY - bird.radius;
          triggerGameOver();
        }

        // Ceiling collision
        if (bird.y - bird.radius <= 0) {
          bird.y = bird.radius;
          bird.vy = 0;
        }

        // Pipe collisions
        g.pipes.forEach((pipe) => {
          if (
            bird.x + bird.radius - 5 > pipe.x &&
            bird.x - bird.radius + 5 < pipe.x + pipeWidth &&
            bird.y - bird.radius + 5 < pipe.topHeight
          ) {
            triggerGameOver();
          }
          if (
            bird.x + bird.radius - 5 > pipe.x &&
            bird.x - bird.radius + 5 < pipe.x + pipeWidth &&
            bird.y + bird.radius - 5 > pipe.bottomY
          ) {
            triggerGameOver();
          }
        });
      } else if (gameState === "READY") {
        // Idle gentle float
        bird.y = 220 + Math.sin(timestamp * 0.006) * 7;
        bird.angle = 0;
        bird.flapFrame = (bird.flapFrame + 0.1) % 3;
      }

      // 6. Draw Bird
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.angle);

      // Body (Arcade Bird)
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = borderLineColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Wing (Flapping motion)
      const wingY = Math.sin(bird.flapFrame * Math.PI) * 4;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.ellipse(-5, wingY, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eye
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(6, -5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(8, -5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(11, -2);
      ctx.lineTo(20, 2);
      ctx.lineTo(11, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // 7. Draw Floating Score Numbers
      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 1;
        ft.opacity -= 0.025;
        if (ft.opacity <= 0) {
          g.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.fillStyle = isDarkTheme ? "#facc15" : "#000000";
        ctx.font = "900 16px monospace";
        ctx.globalAlpha = ft.opacity;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
      }

      // 8. Update & Draw Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;
        if (p.life <= 0) {
          g.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
      }

      // 9. Big In-Game Score Display
      if (gameState === "PLAYING" || gameState === "READY") {
        ctx.fillStyle = isDarkTheme ? "#ffffff" : "#000000";
        ctx.font = "900 38px monospace";
        ctx.textAlign = "center";
        ctx.fillText(g.score.toString(), width / 2, 60);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, timeOfDay, triggerGameOver, soundEnabled]);

  return (
    <div className="flex flex-col h-full w-full bg-[var(--surface-muted)] relative overflow-hidden select-none">
      {/* Header */}
      <GameHeader
        gameId="flappy"
        score={score}
        highScore={currentHighScore}
        extraBadges={
          medal
            ? [{ label: "Medal", value: `${medal.emoji} ${medal.name}` }]
            : [{ label: "Goal", value: "10 🥉" }]
        }
        isPlaying={gameState === "PLAYING"}
        isPaused={gameState === "PAUSED"}
        onPauseToggle={() =>
          setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"))
        }
        onRestart={resetGame}
        onBack={onBack}
      />

      {/* Main Game Stage Area */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative cursor-pointer"
        onClick={jump}
      >
        {/* Environment Sky Toggle */}
        <div className="mb-2 flex items-center gap-1.5 bg-[var(--surface)] border-2 border-[var(--line)] rounded-full px-2.5 py-1 shadow-sm">
          <span className="text-[10px] font-black uppercase text-[var(--secondary-text)] mr-1">
            Sky:
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTimeOfDay("day");
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              timeOfDay === "day"
                ? "bg-sky-400 text-black shadow-sm"
                : "text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
            }`}
          >
            ☀️ Day
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTimeOfDay("sunset");
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              timeOfDay === "sunset"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
            }`}
          >
            🌅 Sunset
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTimeOfDay("night");
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              timeOfDay === "night"
                ? "bg-indigo-900 text-white shadow-sm"
                : "text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
            }`}
          >
            🌙 Night
          </button>
        </div>

        {/* Canvas Game Frame */}
        <div className="relative border-4 border-[var(--line)] rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_var(--line)] bg-sky-400">
          <canvas
            ref={canvasRef}
            width={380}
            height={480}
            className="w-full max-w-[380px] h-auto max-h-[calc(100vh-250px)] block aspect-[380/480]"
          />

          {/* READY Overlay */}
          {gameState === "READY" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center text-black text-3xl shadow-[4px_4px_0px_0px_var(--line)] animate-bounce">
                🐦
              </div>
              <div>
                <h3 className="text-2xl font-black text-white drop-shadow-md">
                  Flappable Bird
                </h3>
                <p className="text-xs font-bold text-white/90 mt-1 max-w-[220px]">
                  Tap anywhere or press <span className="underline font-mono">SPACE</span> to flap!
                </p>
              </div>

              {/* Medal Milestones Preview */}
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/20 text-[11px] font-bold">
                <span>🥉 10</span>
                <span>🥈 25</span>
                <span>🥇 50</span>
                <span>💎 100</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  jump();
                }}
                className="px-6 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-black text-sm hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current stroke-[2]" />
                <span>START FLYING</span>
              </button>
            </div>
          )}

          {/* PAUSED Overlay */}
          {gameState === "PAUSED" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
              <span className="text-3xl font-black tracking-widest uppercase">PAUSED</span>
              <p className="text-xs font-bold text-white/80">Press P or tap to resume</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGameState("PLAYING");
                }}
                className="px-6 py-2 rounded-xl bg-[var(--accent)] text-black font-extrabold text-xs border-2 border-[var(--line)] cursor-pointer"
              >
                Resume
              </button>
            </div>
          )}
        </div>

        {/* Big Tap to Flap button for mobile and quick play (hidden on Game Over) */}
        {gameState !== "GAMEOVER" && (
          <div className="w-full max-w-[380px] mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                jump();
              }}
              className="flex-1 py-3.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-black text-sm active:translate-y-1 shadow-[3px_3px_0px_0px_var(--line)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>TAP TO FLAP</span>
              <span className="text-base">🚀</span>
            </button>
          </div>
        )}
      </div>

      {/* GAME OVER Full Screen Overlay (Root Level) */}
      {gameState === "GAMEOVER" && (
        <GameOverScreen
          gameId="flappy"
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
