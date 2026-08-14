import React, { useRef, useEffect } from "react";
import { useFileTransferStore } from "../hooks/useFileTransfer";
import { useThemeStore } from "../store/useThemeStore";

interface NetworkTransferCanvasProps {
  senderAvatar: string;
  receiverAvatar: string;
  senderName: string;
  receiverName: string;
}

interface Packet {
  t: number;          // Progress along the curve (0 to 1)
  speed: number;      // Progress increment per frame
  size: number;       // Radius of the packet node
  history: { x: number; y: number }[]; // Trail coordinates
  alpha: number;
}

interface Pulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

// Convert Hex to RGBA safely for canvas rendering colors
const hexToRgba = (hex: string, alpha: number): string => {
  let c = hex.trim();
  if (c.startsWith("var")) return hex;
  
  if (c.startsWith("#")) {
    c = c.substring(1);
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const num = parseInt(c, 16);
    if (isNaN(num)) return hex;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

export const NetworkTransferCanvas: React.FC<NetworkTransferCanvasProps> = React.memo(({
  senderAvatar,
  receiverAvatar,
  senderName,
  receiverName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const state = useFileTransferStore((s) => ({
    status: s.status,
    speed: s.stats?.speed || 0,
  }));
  const { isDark } = useThemeStore();

  // Persistent animation references to avoid React updates
  const animationData = useRef({
    packets: [] as Packet[],
    pulses: [] as Pulse[],
    lastSpawnTime: 0,
    pulseTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI (retina) screens
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Easing helper for packet movement (accelerate in middle, decelerate at ends)
    const easeInOutCubic = (x: number): number => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    // Calculate Bezier quadratic curve point
    const getBezierPoint = (t: number, p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      return { x, y };
    };

    // Main animation loop
    const animate = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, width, height);

      // Define endpoints for avatars
      const senderPos = { x: 70, y: height / 2 };
      const receiverPos = { x: width - 70, y: height / 2 };

      // Bending Bezier control point (creates a nice cybernetic curved bridge)
      const controlPos = {
        x: width / 2,
        y: height / 2 - 80,
      };

      // Get accent color dynamically from root styling
      const rootStyle = getComputedStyle(document.documentElement);
      const accentColor = rootStyle.getPropertyValue("--accent").trim() || "#f97316";

      // 1. Draw glowing background grid connections
      ctx.beginPath();
      ctx.moveTo(senderPos.x, senderPos.y);
      ctx.quadraticCurveTo(controlPos.x, controlPos.y, receiverPos.x, receiverPos.y);
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // Main active pathway line
      ctx.beginPath();
      ctx.moveTo(senderPos.x, senderPos.y);
      ctx.quadraticCurveTo(controlPos.x, controlPos.y, receiverPos.x, receiverPos.y);
      const pathwayGradient = ctx.createLinearGradient(senderPos.x, senderPos.y, receiverPos.x, receiverPos.y);
      pathwayGradient.addColorStop(0, accentColor);
      pathwayGradient.addColorStop(1, hexToRgba(accentColor, 0.2));
      ctx.strokeStyle = pathwayGradient;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Manage animation calculations (freeze if paused)
      if (state.status !== "PAUSED" && state.status !== "IDLE" && state.status !== "COMPLETED") {
        const speed = state.speed; // Speed in MB/s
        
        // Spawn rate scales with speed: max 1 packet every 4 frames, min 1 every 60 frames
        const spawnDelay = Math.max(4, Math.min(60, 100 / (speed + 0.1)));
        const now = performance.now();

        if (now - animationData.current.lastSpawnTime > spawnDelay) {
          // Spawn new packet
          // Speed along curve ranges from 0.008 to 0.035 based on file sharing transfer rates
          const packetSpeed = Math.max(0.008, Math.min(0.035, 0.008 + speed * 0.001));
          animationData.current.packets.push({
            t: 0,
            speed: packetSpeed,
            size: Math.max(3, Math.min(6, 3 + speed * 0.2)),
            history: [],
            alpha: 1,
          });
          animationData.current.lastSpawnTime = now;

          // Spawn pulse at sender
          animationData.current.pulses.push({
            x: senderPos.x,
            y: senderPos.y,
            radius: 5,
            maxRadius: 30,
            alpha: 0.8,
            color: accentColor,
          });
        }

        // Update packets
        animationData.current.packets.forEach((packet, idx) => {
          packet.t += packet.speed;

          // Compute raw Bezier position using easing for motion physics
          const easedT = easeInOutCubic(packet.t);
          const pos = getBezierPoint(easedT, senderPos, controlPos, receiverPos);

          packet.history.push(pos);
          if (packet.history.length > 10) {
            packet.history.shift();
          }

          // Packet reaches destination
          if (packet.t >= 1) {
            // Remove packet
            animationData.current.packets.splice(idx, 1);

            // Trigger receiver node pulse wave!
            animationData.current.pulses.push({
              x: receiverPos.x,
              y: receiverPos.y,
              radius: 5,
              maxRadius: 40,
              alpha: 0.9,
              color: accentColor,
            });
          }
        });

        // Update pulses
        animationData.current.pulses.forEach((pulse, idx) => {
          pulse.radius += 1.5;
          pulse.alpha -= 0.03;
          if (pulse.alpha <= 0) {
            animationData.current.pulses.splice(idx, 1);
          }
        });
      }

      // 3. Render Pulses (expanding rings)
      animationData.current.pulses.forEach((pulse) => {
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = pulse.color;
        ctx.globalAlpha = Math.max(0, pulse.alpha);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });

      // 4. Render Packets (glowing data circles)
      animationData.current.packets.forEach((packet) => {
        // Draw particle trail
        if (packet.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(packet.history[0].x, packet.history[0].y);
          for (let i = 1; i < packet.history.length; i++) {
            ctx.lineTo(packet.history[i].x, packet.history[i].y);
          }
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = packet.size * 0.8;
          ctx.stroke();
        }

        // Draw packet head
        if (packet.history.length > 0) {
          const head = packet.history[packet.history.length - 1];
          ctx.save();
          ctx.beginPath();
          ctx.arc(head.x, head.y, packet.size, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          
          // Apply electric glow
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = packet.alpha;
          ctx.fill();
          ctx.restore();
        }
      });

      // Reset global alpha
      ctx.globalAlpha = 1.0;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [state.status, state.speed, isDark]);

  return (
    <div className="relative w-full h-44 flex items-center justify-between px-6 select-none bg-[var(--surface-muted)] border border-[var(--line)]/10 rounded-2xl overflow-hidden glassmorphism shadow-inner">
      {/* Canvas Layer behind Avatars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Sender Info (Left) */}
      <div className="relative flex flex-col items-center z-10 w-24">
        <div className="relative">
          {/* Glowing pulse ring if actively transmitting */}
          {state.status === "TRANSFERRING" && (
            <span className="absolute -inset-1 rounded-full bg-[var(--accent)] opacity-20 animate-ping duration-1000" />
          )}
          <img
            src={senderAvatar}
            alt={senderName}
            className="w-14 h-14 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] object-cover shadow-[0_0_15px_rgba(0,0,0,0.15)]"
          />
        </div>
        <span className="mt-2 text-[11px] font-bold text-[var(--primary-text)] truncate max-w-full text-center">
          {senderName}
        </span>
        <span className="text-[9px] font-extrabold text-[var(--accent)] uppercase tracking-wider">
          Sender
        </span>
      </div>

      {/* Center status message */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 select-none">
        {state.status === "PAUSED" ? (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 tracking-wider uppercase animate-pulse">
            Paused
          </span>
        ) : state.status === "CONNECTING" ? (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] tracking-wider uppercase animate-pulse">
            Connecting...
          </span>
        ) : state.status === "TRANSFERRING" ? (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 tracking-wider uppercase">
            {state.speed > 0 ? `${state.speed.toFixed(2)} MB/s` : "Streaming..."}
          </span>
        ) : null}
      </div>

      {/* Receiver Info (Right) */}
      <div className="relative flex flex-col items-center z-10 w-24">
        <div className="relative">
          {state.status === "TRANSFERRING" && (
            <span className="absolute -inset-1 rounded-full bg-[var(--accent)] opacity-10 animate-pulse" />
          )}
          <img
            src={receiverAvatar}
            alt={receiverName}
            className="w-14 h-14 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] object-cover shadow-[0_0_15px_rgba(0,0,0,0.15)]"
          />
        </div>
        <span className="mt-2 text-[11px] font-bold text-[var(--primary-text)] truncate max-w-full text-center">
          {receiverName}
        </span>
        <span className="text-[9px] font-extrabold text-[var(--secondary-text)] uppercase tracking-wider">
          Receiver
        </span>
      </div>
    </div>
  );
});

NetworkTransferCanvas.displayName = "NetworkTransferCanvas";
