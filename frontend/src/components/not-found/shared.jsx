import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Compass, MessageSquare, Radio, Gamepad2, Share2, Sparkles } from "lucide-react";

export const NOT_FOUND_DEFAULTS = {
  code: "404",
  title: "Lost in the Digital Void",
  description: "The frequency you tuned into does not exist or has drifted into deep cyberspace.",
  homeHref: "/",
  homeLabel: "Back to Safety",
  browseHref: null,
  browseLabel: "Go Back",
};

/**
 * Stage container for the 404 block with cybernetic backdrop, ambient glow, and responsive layout.
 */
export function NotFoundStage({ children, className = "" }) {
  return (
    <div
      className={`relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 overflow-hidden select-none ${className}`}
    >
      {/* Ambient background glow and grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-40 dark:opacity-25 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute w-[36rem] h-[36rem] rounded-full bg-[var(--accent)]/15 blur-[120px] animate-pulse" />
        <div className="absolute w-[24rem] h-[24rem] rounded-full bg-[#00e5ff]/10 blur-[100px] translate-x-32 -translate-y-20" />
        <div className="absolute w-[20rem] h-[20rem] rounded-full bg-[#ff0040]/10 blur-[90px] -translate-x-32 translate-y-20" />
        
        {/* Subtle Cyber Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(var(--line) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        {children}
      </div>
    </div>
  );
}

/**
 * Action buttons with primary neo-brutal styling and secondary back/browse actions.
 */
export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
  onReplay,
}) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 w-full max-w-md">
      {homeHref && (
        <Link
          to={homeHref}
          className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-black bg-[var(--accent)] border-2 border-[var(--line)] shadow-[4px_4px_0px_0px_var(--line)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--line)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150"
        >
          <Home className="size-4 stroke-[2.5]" />
          <span>{homeLabel}</span>
        </Link>
      )}

      {browseHref ? (
        <Link
          to={browseHref}
          className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm text-[var(--primary-text)] bg-[var(--surface)] border-2 border-[var(--line)] shadow-[4px_4px_0px_0px_var(--line)] hover:bg-[var(--surface-muted)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--line)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150"
        >
          <Compass className="size-4 stroke-[2.5]" />
          <span>{browseLabel}</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm text-[var(--primary-text)] bg-[var(--surface)] border-2 border-[var(--line)] shadow-[4px_4px_0px_0px_var(--line)] hover:bg-[var(--surface-muted)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--line)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" />
          <span>{browseLabel}</span>
        </button>
      )}
    </div>
  );
}

/**
 * Quick navigation hub for Chatly features.
 */
export function NotFoundQuickHub() {
  const hubs = [
    { label: "Messages", href: "/", icon: MessageSquare, desc: "Active conversations" },
    { label: "Audio Rooms", href: "/audio-rooms", icon: Radio, desc: "Live voice hangouts" },
    { label: "Mini Games", href: "/games", icon: Gamepad2, desc: "Arcade challenges" },
    { label: "P2P Transfer", href: "/test-p2p", icon: Share2, desc: "Direct file beam" },
  ];

  return (
    <div className="mt-12 w-full max-w-xl">
      <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-[var(--secondary-text)]">
        <Sparkles className="size-3.5 text-[var(--accent)]" />
        <span>Alternative Coordinates</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {hubs.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              className="group flex flex-col items-center p-3.5 rounded-2xl bg-[var(--surface)] border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--line)] hover:border-[var(--accent)] transition-all duration-150"
            >
              <div className="size-9 rounded-xl flex items-center justify-center bg-[var(--surface-muted)] border border-[var(--line)]/30 group-hover:scale-110 group-hover:bg-[var(--accent)]/15 transition-all">
                <Icon className="size-4 text-[var(--primary-text)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <span className="mt-2 text-xs font-bold text-[var(--primary-text)] group-hover:text-[var(--accent)] transition-colors">
                {item.label}
              </span>
              <span className="text-[10px] text-[var(--secondary-text)] truncate max-w-full">
                {item.desc}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
