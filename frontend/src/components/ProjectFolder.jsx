import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { X, Star, Quote, Sparkles } from "lucide-react";

export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 25,
};

function useHoverCapable() {
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanHover(mq.matches);
      const listener = (e) => setCanHover(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);
  return canHover;
}

const MAX_PREVIEWS = 5;
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getPreviewTransform(index, count) {
  const offset = index - (count - 1) / 2;
  const distance = Math.abs(offset);
  const centerLift = Math.max(0, 2 - distance) * 8;

  return {
    x: offset * 48,
    y: 10 - centerLift,
    rotate: offset * 7,
    scale: distance === 0 ? 1.05 : distance === 1 ? 0.95 : 0.88,
    opacity: distance === 0 ? 1 : distance === 1 ? 0.85 : 0.65,
    zIndex: 10 - distance,
  };
}

export function ProjectFolder({
  title,
  description = "Click to inspect testimonials",
  previews = [],
  count = previews.length,
  itemLabel = "review",
  open,
  defaultOpen = false,
  onOpenChange,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onClick,
  disabled = false,
  ariaLabel,
  className = "",
}) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const layoutGroupId = useId();
  const dialogTitleId = `${layoutGroupId}-title`;
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const restoringFocusRef = useRef(false);
  const folderButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [isClosing, setIsClosing] = useState(false);
  const openControlled = open !== undefined;
  const expandedControlled = expanded !== undefined;
  const isExpanded = expanded ?? internalExpanded;
  const isOpen = (open ?? internalOpen) || isExpanded;
  const previewItems = previews.slice(0, MAX_PREVIEWS);
  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const countText = `${count} ${itemLabel}${count === 1 ? "" : "s"}`;

  const setOpen = useCallback(
    (next) => {
      if (disabled) return;
      if (!openControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [disabled, onOpenChange, openControlled]
  );

  const setExpanded = useCallback(
    (next) => {
      if (disabled || previewItems.length === 0) return;
      if (!expandedControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [disabled, expandedControlled, onOpenChange, previewItems.length]
  );

  const finishClose = useCallback(() => {
    setIsClosing(false);
    restoringFocusRef.current = true;
    requestAnimationFrame(() => folderButtonRef.current?.focus());
  }, []);

  const closeOverlay = useCallback(() => {
    setIsClosing(true);
    setOpen(false);
    setExpanded(false);
  }, [setExpanded, setOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reduce && isClosing) finishClose();
  }, [finishClose, isClosing, reduce]);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const focusFrame = requestAnimationFrame(() =>
      closeButtonRef.current?.focus()
    );

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlay();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((element) => element.tabIndex >= 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOverlay, isExpanded]);

  const handleFolderClick = () => {
    setIsClosing(false);
    setExpanded(true);
    setOpen(true);
    onClick?.();
  };

  const overlay =
    isExpanded || isClosing ? (
      <>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.button
              key="project-files-backdrop"
              type="button"
              tabIndex={-1}
              aria-label="Close review overlay"
              onClick={closeOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.2 }}
              className={`fixed inset-0 z-50 cursor-default bg-black/60 backdrop-blur-md ${
                isClosing ? "pointer-events-none" : ""
              }`}
            />
          )}
        </AnimatePresence>

        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-hidden={isExpanded ? undefined : "true"}
          className="pointer-events-none fixed inset-x-4 inset-y-6 sm:inset-x-8 sm:inset-y-10 z-50 flex items-center justify-center overflow-y-auto no-scrollbar"
        >
          <div
            className={`pointer-events-auto relative z-10 w-full max-w-5xl my-auto ${
              isClosing ? "pointer-events-none" : ""
            }`}
          >
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="project-files-header"
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.2 }}
                  className="mb-6 flex items-center justify-between gap-4 bg-[var(--surface)] p-5 rounded-2xl border-2 border-[var(--line)] shadow-[6px_6px_0px_0px_var(--line)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center">
                      <Sparkles className="size-5 text-[var(--primary-text)]" />
                    </div>
                    <div>
                      <h2
                        id={dialogTitleId}
                        className="text-xl font-black text-[var(--primary-text)] font-mono tracking-tight"
                      >
                        {title}
                      </h2>
                      <p className="text-xs font-bold text-[var(--secondary-text)]">
                        {countText} • Verified Chatly Users
                      </p>
                    </div>
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeOverlay}
                    aria-label={`Close ${title}`}
                    className="flex size-10 items-center justify-center rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--line)]"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {isExpanded &&
                previewItems.map((preview) => (
                  <motion.div
                    key={preview.id}
                    layoutId={`file-${preview.id}`}
                    transition={transition}
                    className="w-full bg-[var(--surface)] rounded-3xl p-6 border-2 border-[var(--line)] shadow-[6px_6px_0px_0px_var(--line)] flex flex-col justify-between hover:-translate-y-1 transition-transform"
                  >
                    {preview.content}
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </>
    ) : null;

  return (
    <LayoutGroup id={layoutGroupId}>
      <motion.button
        ref={folderButtonRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isExpanded}
        data-open={isOpen ? "true" : "false"}
        data-expanded={isExpanded ? "true" : "false"}
        tabIndex={isExpanded ? -1 : undefined}
        onPointerEnter={() => {
          if (!canHover) return;
          hoveredRef.current = true;
          setOpen(true);
        }}
        onPointerLeave={() => {
          if (!canHover) return;
          hoveredRef.current = false;
          if (!isExpanded && !isClosing) setOpen(focusedRef.current);
        }}
        onFocus={() => {
          if (restoringFocusRef.current) {
            restoringFocusRef.current = false;
            focusedRef.current = false;
            return;
          }
          focusedRef.current = true;
          setOpen(true);
        }}
        onBlur={() => {
          focusedRef.current = false;
          if (!isExpanded && !isClosing) setOpen(hoveredRef.current);
        }}
        onClick={handleFolderClick}
        whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
        whileHover={reduce || disabled ? undefined : { y: -4 }}
        transition={reduce ? { duration: 0 } : SPRING_PRESS}
        className={`relative block h-64 w-80 sm:w-96 select-none rounded-3xl text-left outline-none [perspective:1200px] border-2 border-[var(--line)] bg-[var(--surface-muted)] shadow-[8px_8px_0px_0px_var(--line)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer group ${className}`}
      >
        {/* Back Flap */}
        <motion.span
          aria-hidden="true"
          animate={{ rotateX: isOpen && !reduce ? 16 : 0 }}
          transition={transition}
          className="absolute inset-0 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] [transform-origin:center_bottom]"
        />

        {/* Floating Stacked Preview Cards */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute left-1/2 top-4 block h-0 w-0">
            <AnimatePresence initial={false}>
              {!isExpanded &&
                previewItems.map((preview, index) => {
                  const opened = getPreviewTransform(
                    index,
                    previewItems.length
                  );
                  return (
                    <motion.span
                      key={preview.id}
                      layoutId={`file-${preview.id}`}
                      initial={false}
                      animate={
                        isOpen && !reduce
                          ? {
                              x: opened.x * 1.5,
                              y: opened.y - 18,
                              rotate: opened.rotate * 1.3,
                              scale: opened.scale * 1.04,
                              opacity: Math.min(1, opened.opacity + 0.2),
                            }
                          : {
                              x: opened.x,
                              y: opened.y,
                              rotate: opened.rotate,
                              scale: opened.scale,
                              opacity: opened.opacity,
                            }
                      }
                      transition={transition}
                      onLayoutAnimationComplete={() => {
                        if (isClosing && index === 0) finishClose();
                      }}
                      className="absolute left-0 top-0 -ml-16 block h-44 w-32 overflow-hidden rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-2.5 shadow-[4px_4px_0px_0px_var(--line)]"
                      style={{ zIndex: opened.zIndex }}
                    >
                      <div className="w-full h-full flex flex-col justify-between text-[9px] pointer-events-none overflow-hidden">
                        {preview.previewSnippet || preview.content}
                      </div>
                    </motion.span>
                  );
                })}
            </AnimatePresence>
          </span>
        </span>

        {/* Front Flap */}
        <motion.span
          initial={false}
          animate={{ rotateX: isOpen && !reduce ? -26 : 0 }}
          transition={transition}
          className="absolute inset-x-0 bottom-0 z-20 overflow-hidden rounded-3xl border-t-2 border-[var(--line)] bg-[var(--surface)] [backface-visibility:hidden] [transform-origin:center_bottom] shadow-sm"
        >
          <span className="flex h-16 items-center px-5 gap-2.5">
            <span className="size-3 rounded-full bg-[var(--accent)] border border-[var(--line)]" />
            <span className="line-clamp-1 text-lg font-black text-[var(--primary-text)] font-mono tracking-tight">
              {title}
            </span>
          </span>
          <span className="flex h-12 items-center justify-between gap-3 border-t-2 border-dashed border-[var(--line)]/30 px-5 bg-[var(--surface-muted)] text-xs font-mono">
            <span className="font-extrabold text-[var(--primary-text)] bg-[var(--accent)]/20 px-2 py-0.5 rounded-md border border-[var(--line)]">
              {countText}
            </span>
            <span className="truncate font-bold text-[var(--secondary-text)]">
              {description}
            </span>
          </span>
        </motion.span>
      </motion.button>

      {mounted ? createPortal(overlay, document.body) : null}
    </LayoutGroup>
  );
}

export default ProjectFolder;
