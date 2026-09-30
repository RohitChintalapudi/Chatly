import { useEffect, useState } from "react";
import { Shield, Sparkles, Zap, Radio } from "lucide-react";

const LOADING_STEPS = [
  "Initializing secure workspace...",
  "Establishing encrypted connection...",
  "Synchronizing audio & chat mesh...",
  "Preparing your experience...",
];

const LoadingScreen = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Cycle through status messages
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);

    // Dynamic progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 92;
        const jump = Math.floor(Math.random() * 12) + 8;
        return Math.min(prev + jump, 92);
      });
    }, 450);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[var(--surface)] text-[var(--primary-text)] overflow-hidden transition-colors duration-300 select-none px-4">
      {/* Dynamic Ambient Background Glows */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none animate-float-slow"
        style={{
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div 
        className="absolute w-[350px] h-[350px] rounded-full blur-2xl opacity-15 pointer-events-none animate-pulse"
        style={{
          background: "radial-gradient(circle, var(--accent-hover) 0%, transparent 70%)",
          bottom: "10%",
          right: "20%",
        }}
      />

      {/* Subtle Technical Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--line) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Neo-Brutalist HUD Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Outer Card */}
        <div className="w-full bg-[var(--surface)] border-2 border-[var(--line)] rounded-3xl p-8 sm:p-10 shadow-[8px_8px_0px_0px_var(--line)] flex flex-col items-center relative overflow-hidden transition-all duration-300">
          
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--line)] bg-[var(--surface-muted)] text-[11px] font-mono font-bold tracking-wider uppercase mb-8 shadow-[2px_2px_0px_0px_var(--line)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            <span className="text-[var(--secondary-text)]">System Handshake</span>
          </div>

          {/* Center Logo Showcase with Orbital Halo */}
          <div className="relative flex items-center justify-center my-2">
            {/* Spinning Orbital Rings */}
            <div className="absolute -inset-6 rounded-full border border-dashed border-[var(--accent)] opacity-30 animate-[spin_12s_linear_infinite]" />
            <div className="absolute -inset-10 rounded-full border border-dotted border-[var(--line)] opacity-20 animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Pulsing Radar Ring */}
            <div className="absolute -inset-4 rounded-3xl bg-[var(--accent)] opacity-20 animate-ping duration-1000 pointer-events-none" />

            {/* Glowing Backdrop */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-hover)] rounded-3xl opacity-25 blur-lg animate-pulse" />

            {/* Logo Badge Container */}
            <div className="relative size-24 sm:size-28 rounded-3xl bg-[var(--surface)] border-2 border-[var(--line)] flex items-center justify-center p-4 shadow-[5px_5px_0px_0px_var(--line)] transition-transform hover:scale-105 duration-300">
              <img
                src="/chatly-logo.png"
                alt="Chatly Logo"
                className="w-full h-full object-contain animate-float drop-shadow-md"
              />
              
              {/* Corner Tech Accent Accent Dots */}
              <span className="absolute top-1.5 left-1.5 size-1.5 rounded-full bg-[var(--line)]" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--line)]" />
              <span className="absolute bottom-1.5 left-1.5 size-1.5 rounded-full bg-[var(--line)]" />
              <span className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-[var(--line)]" />
            </div>
          </div>

          {/* Brand Titles */}
          <div className="flex flex-col items-center text-center mt-7 space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase text-[var(--primary-text)] font-mono">
                CHATLY
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-[var(--accent)] text-[var(--primary-text)] font-extrabold text-[10px] uppercase border border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)]">
                PRO
              </span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--secondary-text)] tracking-wider">
              <Sparkles className="size-3.5 text-[var(--accent)]" />
              <span>More than a chatting app</span>
            </div>
          </div>

          {/* Dynamic Progress Indicator */}
          <div className="w-full mt-8 space-y-3">
            {/* Progress Bar Container */}
            <div className="relative w-full h-3 bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-full overflow-hidden p-[2px] shadow-[2px_2px_0px_0px_var(--line)]">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)`
                }}
              >
                {/* Shimmer Light Sweep */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-[shimmer_1.5s_infinite]"
                  style={{ transform: "skewX(-20deg)" }}
                />
              </div>
            </div>

            {/* Status Text & Percentage */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[var(--secondary-text)] truncate pr-2">
                <Radio className="size-3.5 text-[var(--accent)] animate-pulse shrink-0" />
                <span className="truncate font-medium transition-all duration-300 key={currentStepIndex}">
                  {LOADING_STEPS[currentStepIndex]}
                </span>
              </div>
              <span className="font-bold text-[var(--primary-text)] shrink-0">
                {progress}%
              </span>
            </div>
          </div>

          {/* Feature Badges Footer */}
          <div className="grid grid-cols-3 gap-2 w-full mt-7 pt-5 border-t border-dashed border-[var(--line)]/30 text-[11px] font-mono">
            <div className="flex flex-col items-center text-center gap-1 p-1.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--line)]/20">
              <Shield className="size-3.5 text-[var(--accent)]" />
              <span className="text-[9px] font-bold text-[var(--secondary-text)] uppercase">E2E Secure</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-1.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--line)]/20">
              <Zap className="size-3.5 text-[var(--accent)]" />
              <span className="text-[9px] font-bold text-[var(--secondary-text)] uppercase">P2P Mesh</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-1.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--line)]/20">
              <Sparkles className="size-3.5 text-[var(--accent)]" />
              <span className="text-[9px] font-bold text-[var(--secondary-text)] uppercase">Arcade+</span>
            </div>
          </div>

        </div>

        {/* Ambient Bottom Tag */}
        <p className="mt-4 text-[11px] font-mono text-[var(--secondary-text)] opacity-70 tracking-widest uppercase text-center">
          Crafted for high-performance communication
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
