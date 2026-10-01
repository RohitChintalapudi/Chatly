import { AlertCircle, MessageSquare, X, Sparkles, Send, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, StatefulButton } from "../motion/button";
import { EASE_OUT, MORPH_OPEN_EASE, MORPH_CLOSE_EASE } from "../../lib/ease";
import { cn } from "../../lib/utils";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const SUCCESS_DURATION_MS = 2000;
const MORPH_OPEN_DURATION = 0.4;
const MORPH_CLOSE_DURATION = 0.28;
const MORPH_FADE_DURATION = 0.22;
const MORPH_SLIDE = 30;
const MORPH_SCALE = 0.97;
const MORPH_BLUR = "blur(2px)";

// Celebration sprinkles that burst from the success icon.
const SPRINKLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    x: Math.cos(angle) * 32,
    y: Math.sin(angle) * 32,
    color: i % 2 === 0 ? "#22c55e" : "var(--accent)",
  };
});

const CATEGORIES = [
  { id: "idea", label: "💡 Idea" },
  { id: "bug", label: "🐛 Bug" },
  { id: "praise", label: "❤️ Praise" },
];

export function FeedbackWidget({
  onSubmit,
  position = "bottom-right",
  title = "Help us improve",
  placeholder = "Share an idea, feedback, or report a bug...",
  icon,
  className = "",
}) {
  const { authUser } = useAuthStore();
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const textareaRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("idea");

  const open = status !== "idle";
  const busy = status === "sending";

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    setStatus("idle");
    setMessage("");
  }, [clearCloseTimer]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (status !== "open") return;

    const timer = window.setTimeout(
      () => textareaRef.current?.focus(),
      reduce ? 0 : MORPH_OPEN_DURATION * 1000
    );
    return () => window.clearTimeout(timer);
  }, [status, reduce]);

  // Dismiss on escape or outside click while open (but not mid-send).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) close();
    };
    const onPointer = (e) => {
      if (
        !busy &&
        rootRef.current &&
        !rootRef.current.contains(e.target)
      ) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, busy, close]);

  const scheduleSuccessClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(close, SUCCESS_DURATION_MS);
  };

  const submit = async () => {
    if (busy || message.trim().length === 0) return;
    setStatus("sending");
    try {
      if (onSubmit) {
        await onSubmit({ message, category });
      } else {
        // Built-in backend feedback submission
        await axiosInstance.post("/contact", {
          name: authUser?.fullName || "Chatly Explorer",
          email: authUser?.email || "anonymous@chatly.app",
          subject: `Feedback [${category.toUpperCase()}]: ${message.slice(0, 30)}...`,
          message: message,
          feedback: `[${category.toUpperCase()}] ${message}`,
        });
      }
      setStatus("sent");
      toast.success("Feedback submitted! Thank you!", { id: "feedback-success" });
      scheduleSuccessClose();
    } catch (err) {
      console.error("Failed to send feedback", err);
      setStatus("error");
      toast.error("Failed to send feedback. Please retry.", { id: "feedback-error" });
    }
  };

  const left = position === "bottom-left";
  const contentOffset = left ? -MORPH_SLIDE : MORPH_SLIDE;
  
  const surfaceTransition = reduce
    ? { duration: 0 }
    : {
        layout: {
          duration: open ? MORPH_OPEN_DURATION : MORPH_CLOSE_DURATION,
          ease: open ? MORPH_OPEN_EASE : MORPH_CLOSE_EASE,
        },
        borderRadius: {
          duration: open ? MORPH_OPEN_DURATION : MORPH_CLOSE_DURATION,
          ease: open ? MORPH_OPEN_EASE : MORPH_CLOSE_EASE,
        },
      };

  const contentTransition = reduce
    ? { duration: 0 }
    : {
        opacity: {
          duration: MORPH_FADE_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        x: {
          duration: MORPH_OPEN_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        scale: {
          duration: MORPH_OPEN_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        filter: {
          duration: MORPH_FADE_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
      };

  const viewInitial = reduce
    ? { opacity: 0 }
    : { opacity: 0, y: 8, filter: "blur(4px)" };

  const viewAnimate = reduce
    ? {
        opacity: 1,
        transition: { duration: 0.18, ease: EASE_OUT },
      }
    : {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.24, ease: EASE_OUT },
      };

  const viewExit = reduce
    ? {
        opacity: 0,
        transition: { duration: 0.14, ease: EASE_OUT },
      }
    : {
        opacity: 0,
        y: -8,
        filter: "blur(4px)",
        transition: { duration: 0.16, ease: EASE_OUT },
      };

  return (
    <aside
      ref={rootRef}
      aria-label="Feedback Widget"
      className={cn(
        "pointer-events-none fixed bottom-5 z-40",
        left ? "left-5" : "right-5",
        className
      )}
    >
      {/* One persistent shell grows out of the corner trigger */}
      <motion.div
        layout
        animate={{ borderRadius: open ? 24 : 28 }}
        transition={surfaceTransition}
        style={{ transformOrigin: left ? "bottom left" : "bottom right" }}
        className={cn(
          "pointer-events-auto absolute bottom-0 overflow-hidden bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] shadow-[4px_4px_0px_0px_var(--line)] transition-colors",
          open ? "w-[min(90vw,340px)] p-3" : "h-12 w-12 p-0",
          left ? "left-0" : "right-0"
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              initial={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: contentOffset,
                      scale: MORPH_SCALE,
                      filter: MORPH_BLUR,
                    }
              }
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: contentOffset,
                      scale: MORPH_SCALE,
                      filter: MORPH_BLUR,
                    }
              }
              transition={contentTransition}
            >
              <motion.div layout="position">
                <AnimatePresence mode="popLayout" initial={false}>
                  {status === "sent" ? (
                    <motion.div
                      key="sent"
                      initial={viewInitial}
                      animate={viewAnimate}
                      exit={viewExit}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--surface-muted)] border border-[var(--line)]/20 px-4 py-6 text-center">
                        <div className="relative mb-1 flex h-14 w-14 items-center justify-center">
                          {reduce
                            ? null
                            : SPRINKLES.map((s, i) => (
                                <motion.span
                                  key={`${s.x}-${s.y}`}
                                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                                  animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.2, 0.4],
                                    x: s.x,
                                    y: s.y,
                                  }}
                                  transition={{
                                    duration: 0.65,
                                    delay: 0.12 + i * 0.02,
                                    ease: "easeOut",
                                  }}
                                  style={{ backgroundColor: s.color }}
                                  className="absolute h-2 w-2 rounded-full border border-[var(--line)]/30"
                                />
                              ))}
                          <motion.div
                            initial={reduce ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 22,
                              delay: 0.04,
                            }}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-black border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]"
                          >
                            <motion.svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="h-6 w-6 text-black"
                            >
                              <motion.path
                                d="M5 12.5l4.5 4.5L19 7.5"
                                stroke="currentColor"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={
                                  reduce ? { pathLength: 1 } : { pathLength: 0 }
                                }
                                animate={{ pathLength: 1 }}
                                transition={{
                                  duration: 0.35,
                                  ease: "easeOut",
                                  delay: 0.15,
                                }}
                              />
                            </motion.svg>
                          </motion.div>
                        </div>
                        <h3 className="text-base font-extrabold text-[var(--primary-text)]">
                          Thanks for your feedback!
                        </h3>
                        <p className="text-xs font-medium leading-relaxed text-[var(--secondary-text)] max-w-[240px]">
                          Your thoughts help us elevate Chatly for everyone.
                        </p>
                      </div>
                    </motion.div>
                  ) : status === "error" ? (
                    <motion.div
                      key="error"
                      initial={viewInitial}
                      animate={viewAnimate}
                      exit={viewExit}
                    >
                      <div
                        role="alert"
                        className="rounded-2xl bg-red-500/10 border-2 border-red-500/30 px-4 py-5 text-center"
                      >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/40">
                          <AlertCircle className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-[var(--primary-text)]">
                          Submission Error
                        </h3>
                        <p className="mt-1 text-xs text-[var(--secondary-text)]">
                          We could not send your feedback. Please try again.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={close}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={submit}
                            className="flex-1"
                          >
                            Try again
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={viewInitial}
                      animate={viewAnimate}
                      exit={viewExit}
                    >
                      <div className="rounded-2xl bg-[var(--surface-muted)] border border-[var(--line)]/30 p-3.5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="size-4 text-[var(--accent)]" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary-text)]">
                              {title}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={close}
                            aria-label="Close"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--secondary-text)] border border-[var(--line)]/40 hover:text-[var(--primary-text)] hover:scale-105 transition-all cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Category selection chips */}
                        <div className="flex gap-1.5 mb-2">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className={cn(
                                "px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer",
                                category === cat.id
                                  ? "bg-[var(--accent)] text-black border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)]"
                                  : "bg-[var(--surface)] text-[var(--secondary-text)] border-[var(--line)]/30 hover:text-[var(--primary-text)]"
                              )}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={placeholder}
                          disabled={busy}
                          rows={3}
                          className="w-full resize-none bg-[var(--surface)] text-sm font-medium text-[var(--primary-text)] rounded-xl p-2.5 border border-[var(--line)]/30 outline-none placeholder:text-[var(--secondary-text)] focus:border-[var(--accent)] transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2.5 px-0.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={close}
                          disabled={busy}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <StatefulButton
                          state={busy ? "loading" : "idle"}
                          loadingText="Sending..."
                          size="sm"
                          onClick={submit}
                          disabled={busy || message.trim().length === 0}
                          className="flex-1"
                        >
                          Send <Send className="size-3 stroke-[2.5]" />
                        </StatefulButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              initial={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -contentOffset,
                      filter: MORPH_BLUR,
                    }
              }
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -contentOffset,
                      filter: MORPH_BLUR,
                    }
              }
              transition={contentTransition}
              onClick={() => {
                clearCloseTimer();
                setStatus("open");
              }}
              aria-label={title}
              aria-haspopup="dialog"
              whileTap={reduce ? undefined : { scale: 0.92 }}
              className={cn(
                "group/btn absolute bottom-0 flex h-12 w-12 items-center justify-center bg-[var(--surface)] text-[var(--primary-text)] hover:text-[var(--accent)] transition-colors cursor-pointer",
                left ? "left-0" : "right-0"
              )}
            >
              <motion.span
                initial={
                  reduce ? false : { rotate: 45, scale: MORPH_SCALE }
                }
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 45, scale: MORPH_SCALE }}
                transition={contentTransition}
                className="grid h-5 w-5 shrink-0 place-items-center group-hover/btn:scale-110 transition-transform"
              >
                {icon ?? <MessageSquare className="h-5 w-5 stroke-[2.2]" />}
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </aside>
  );
}

export default FeedbackWidget;
