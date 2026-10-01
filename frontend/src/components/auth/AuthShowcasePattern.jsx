import { motion } from "framer-motion";
import { MessageSquare, Radio, Share2, Gamepad2, Sparkles, ShieldCheck, Zap, Heart } from "lucide-react";

export const AuthShowcasePattern = ({ title, subtitle, mode = "signin" }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center p-8 xl:p-12 relative overflow-hidden select-none">
      {/* Dynamic Background Gradients & Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-[var(--accent)]/20 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-[#00e5ff]/15 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(var(--line) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Floating Feature Badges */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
          >
            <Radio className="size-3.5 text-rose-500 animate-pulse" />
            <span>Spatial Audio Rooms</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
          >
            <Zap className="size-3.5 text-amber-500" />
            <span>P2P Direct Beam</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
          >
            <Gamepad2 className="size-3.5 text-emerald-500" />
            <span>Retro Arcade</span>
          </motion.div>
        </div>

        {/* Central Interactive Glass Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-6 shadow-[8px_8px_0px_0px_var(--line)] space-y-4 overflow-hidden"
        >
          {/* Card Top Navigation Bar Simulation */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--line)]/20">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-400 border border-[var(--line)]/40" />
              <div className="size-3 rounded-full bg-amber-400 border border-[var(--line)]/40" />
              <div className="size-3 rounded-full bg-emerald-400 border border-[var(--line)]/40" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[var(--secondary-text)]">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>E2E_ENCRYPTED_SESSION</span>
            </div>
          </div>

          {/* Animated Message Previews */}
          <div className="space-y-3 pt-1">
            {/* Message 1 (Incoming) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-start gap-2.5 max-w-[85%]"
            >
              <div className="size-8 rounded-xl bg-[var(--accent)] text-black font-black text-xs flex items-center justify-center border-2 border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)] shrink-0">
                🚀
              </div>
              <div className="bg-[var(--surface-muted)] text-[var(--primary-text)] border-2 border-[var(--line)] p-3 rounded-2xl rounded-tl-sm text-xs font-semibold shadow-[2px_2px_0px_0px_var(--line)]">
                Hey! Just jumped into the Voice Room. The audio quality is crystal clear! 🎙️
              </div>
            </motion.div>

            {/* Message 2 (Outgoing) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-start justify-end gap-2.5 ml-auto max-w-[85%]"
            >
              <div className="bg-[var(--accent)] text-black border-2 border-[var(--line)] p-3 rounded-2xl rounded-tr-sm text-xs font-bold shadow-[2px_2px_0px_0px_var(--line)]">
                Sending you the high-res video via direct P2P beam right now ⚡
              </div>
              <div className="size-8 rounded-xl bg-[var(--surface)] text-[var(--primary-text)] font-black text-xs flex items-center justify-center border-2 border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)] shrink-0">
                😎
              </div>
            </motion.div>

            {/* Message 3 (System / Game Milestone) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="p-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 font-bold text-[var(--primary-text)]">
                <span className="text-base">🏆</span>
                <span>New Arcade Record: <span className="font-mono text-amber-600 dark:text-amber-400">42 pts</span> in Flappy Bird!</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                ARCADE
              </span>
            </motion.div>
          </div>

          {/* Audio Waveform Live Simulation Bar */}
          <div className="pt-2 flex items-center justify-between px-2 text-[11px] font-bold text-[var(--secondary-text)]">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Live Mesh Room Active</span>
            </div>
            <div className="flex items-center gap-0.5 h-3">
              {[40, 80, 50, 100, 60, 90, 45, 75, 30].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ height: ["4px", `${h * 0.14}px`, "4px"] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.08 }}
                  className="w-1 bg-[var(--accent)] rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Headline & Description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)] tracking-tight">
            {title || (mode === "signin" ? "Connect at the Speed of Light" : "Join the Next-Gen Chat Era")}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] max-w-sm mx-auto leading-relaxed">
            {subtitle || "Ultra-fast peer-to-peer file beam, crystal spatial audio hangouts, and built-in retro arcade in one unified ecosystem."}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthShowcasePattern;
