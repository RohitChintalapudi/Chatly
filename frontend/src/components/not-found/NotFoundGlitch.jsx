import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import {
  NOT_FOUND_DEFAULTS,
  NotFoundActions,
  NotFoundStage,
  NotFoundQuickHub,
} from "./shared";
import { RefreshCw, Terminal } from "lucide-react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
const SCRAMBLE_MS = 700;
const TICK_MS = 45;

/**
 * Renders the code, scrambling each character on mount before it settles.
 * SSR and the first paint show the real code, so the scramble is a pure
 * client-side enhancement and reduced-motion users see the code immediately.
 */
export function Scramble({ text, triggerKey = 0 }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }
    const chars = text.split("");
    const start = performance.now();
    let raf = 0;
    let last = 0;

    const loop = (now) => {
      if (now - last >= TICK_MS) {
        last = now;
        const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
        const settled = Math.floor(progress * chars.length);
        setDisplay(
          chars
            .map((ch, i) =>
              i < settled || ch === " "
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            )
            .join("")
        );
      }
      if (now - start < SCRAMBLE_MS) {
        raf = requestAnimationFrame(loop);
      } else {
        setDisplay(text);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text, reduce, triggerKey]);

  return <span className="tabular-nums font-mono">{display}</span>;
}

export function NotFoundGlitch({
  className = "",
  code = NOT_FOUND_DEFAULTS.code,
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
  showQuickHub = true,
  statusBadge = "ERROR_CODE: 0x404_PAGE_MISSING",
}) {
  const [scrambleKey, setScrambleKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleTriggerScramble = useCallback(() => {
    setScrambleKey((prev) => prev + 1);
  }, []);

  return (
    <NotFoundStage className={className}>
      {/* Top Status Terminal Tag */}
      {statusBadge && (
        <button
          type="button"
          onClick={handleTriggerScramble}
          title="Click to re-scramble glitch"
          className="group/badge inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-[var(--secondary-text)] bg-[var(--surface-muted)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)] hover:border-[var(--accent)] hover:text-[var(--primary-text)] transition-all cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <Terminal className="size-3 text-[var(--accent)]" />
          <span>{statusBadge}</span>
          <RefreshCw className="size-2.5 opacity-60 group-hover/badge:rotate-180 transition-transform duration-300" />
        </button>
      )}

      {/* Glitch Animated Scramble Code Display */}
      <div
        onMouseEnter={() => {
          setIsHovered(true);
          handleTriggerScramble();
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleTriggerScramble}
        className="group relative select-none font-mono font-black leading-none tracking-tighter text-[var(--primary-text)] [font-size:clamp(6rem,20vw,12rem)] cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
      >
        {/* Chromatic ghost layer - Magenta/Red (Offset Left/Right on Hover) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[#ff0040] opacity-0 mix-blend-screen dark:mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:translate-x-[4px] group-hover:-translate-y-[1px] group-hover:opacity-85 motion-reduce:hidden"
        >
          <Scramble text={code} triggerKey={scrambleKey} />
        </span>

        {/* Chromatic ghost layer - Cyan/Blue (Offset Opposite on Hover) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[#00e5ff] opacity-0 mix-blend-screen dark:mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:-translate-x-[4px] group-hover:translate-y-[1px] group-hover:opacity-85 motion-reduce:hidden"
        >
          <Scramble text={code} triggerKey={scrambleKey} />
        </span>

        {/* Main Settled / Scrambled Text */}
        <h1 className="relative drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <Scramble text={code} triggerKey={scrambleKey} />
        </h1>
      </div>

      {/* Subtitles & Descriptions */}
      <div className="flex flex-col items-center gap-2 mt-4 max-w-lg">
        <p className="text-xl sm:text-2xl font-black text-[var(--primary-text)] tracking-tight">
          {title}
        </p>
        <p className="max-w-md text-sm sm:text-base font-medium text-[var(--secondary-text)] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      <NotFoundActions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
        onReplay={handleTriggerScramble}
      />

      {/* Quick Nav Hub */}
      {showQuickHub && <NotFoundQuickHub />}
    </NotFoundStage>
  );
}

export default NotFoundGlitch;
