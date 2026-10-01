import { useMemo } from "react";
import { useThemeStore, getAccentByKey } from "../../store/useThemeStore";
import { motion } from "framer-motion";

export const AuthBackgroundBubbles = () => {
  const { accentKey, isDark } = useThemeStore();
  const accent = useMemo(() => getAccentByKey(accentKey), [accentKey]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* Central Ambient Accent Glow behind Card */}
      <div
        className="absolute w-[520px] h-[520px] rounded-full blur-[130px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${accent.accent} 25%, transparent) 0%, color-mix(in srgb, ${accent.hover} 10%, transparent) 50%, transparent 75%)`,
        }}
      />

      {/* Bubble 1 - Top Left (Large 44) */}
      <div
        className="absolute w-44 h-44 rounded-full border-2 border-[var(--line)] top-[7%] left-[4%] animate-float shadow-[5px_5px_0px_0px_var(--line)] overflow-hidden transition-all duration-300"
        style={{
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent.accent} 40%, white) 0%, color-mix(in srgb, ${accent.accent} 22%, var(--surface)) 45%, color-mix(in srgb, ${accent.hover} 12%, transparent) 85%)`,
        }}
      >
        <div className="absolute top-[14%] left-[18%] w-[36%] h-[20%] rounded-full bg-white/45 blur-[0.8px] -rotate-25" />
      </div>

      {/* Bubble 2 - Bottom Right (Medium 32) */}
      <div
        className="absolute w-32 h-32 rounded-full border-2 border-[var(--line)] bottom-[10%] right-[6%] animate-float-slow shadow-[4px_4px_0px_0px_var(--line)] overflow-hidden transition-all duration-300"
        style={{
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent.hover} 45%, white) 0%, color-mix(in srgb, ${accent.accent} 25%, var(--surface)) 50%, color-mix(in srgb, ${accent.accent} 10%, transparent) 85%)`,
        }}
      >
        <div className="absolute top-[14%] left-[18%] w-[34%] h-[20%] rounded-full bg-white/50 blur-[0.8px] -rotate-25" />
      </div>

      {/* Bubble 3 - Top Right (Small 20) */}
      <div
        className="absolute w-20 h-20 rounded-full border-2 border-[var(--line)] top-[16%] right-[16%] animate-float shadow-[3px_3px_0px_0px_var(--line)] overflow-hidden transition-all duration-300"
        style={{
          animationDelay: "2s",
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent.accent} 45%, white) 0%, color-mix(in srgb, ${accent.accent} 22%, var(--surface)) 50%, color-mix(in srgb, ${accent.hover} 10%, transparent) 85%)`,
        }}
      >
        <div className="absolute top-[14%] left-[18%] w-[36%] h-[22%] rounded-full bg-white/50 blur-[0.5px] -rotate-25" />
      </div>

      {/* Bubble 4 - Bottom Left (Medium 26) */}
      <div
        className="absolute w-26 h-26 rounded-full border-2 border-[var(--line)] bottom-[20%] left-[10%] animate-float shadow-[3px_3px_0px_0px_var(--line)] overflow-hidden transition-all duration-300"
        style={{
          animationDelay: "1.2s",
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent.accent} 38%, white) 0%, color-mix(in srgb, ${accent.hover} 20%, var(--surface)) 50%, color-mix(in srgb, ${accent.accent} 8%, transparent) 85%)`,
        }}
      >
        <div className="absolute top-[14%] left-[18%] w-[36%] h-[20%] rounded-full bg-white/45 blur-[0.6px] -rotate-25" />
      </div>

      {/* Bubble 5 - Right Center (Small 16) */}
      <div
        className="absolute w-16 h-16 rounded-full border-2 border-[var(--line)] top-[55%] right-[7%] animate-float-slow shadow-[2px_2px_0px_0px_var(--line)] overflow-hidden transition-all duration-300"
        style={{
          animationDelay: "3.5s",
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent.hover} 40%, white) 0%, color-mix(in srgb, ${accent.accent} 18%, var(--surface)) 50%, transparent 85%)`,
        }}
      >
        <div className="absolute top-[14%] left-[18%] w-[34%] h-[22%] rounded-full bg-white/50 blur-[0.5px] -rotate-25" />
      </div>

      {/* Bubble 6 - Left Center (Tiny 12) */}
      <div
        className="absolute w-12 h-12 rounded-full border-2 border-[var(--line)] top-[46%] left-[3%] animate-float shadow-[2px_2px_0px_0px_var(--line)] overflow-hidden transition-all duration-300"
        style={{
          animationDelay: "4.2s",
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent.accent} 45%, white) 0%, color-mix(in srgb, ${accent.accent} 20%, var(--surface)) 50%, transparent 85%)`,
        }}
      >
        <div className="absolute top-[14%] left-[18%] w-[36%] h-[22%] rounded-full bg-white/50 blur-[0.5px] -rotate-25" />
      </div>

      {/* Subtle Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(var(--line) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
};

export default AuthBackgroundBubbles;
