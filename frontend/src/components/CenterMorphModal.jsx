import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const CenterMorphModalContext = createContext(null);

function useCenterMorphModalContext(component) {
  const context = useContext(CenterMorphModalContext);
  if (!context) {
    throw new Error(`${component} must be used within <CenterMorphModal>`);
  }
  return context;
}

/**
 * Root CenterMorphModal Component
 */
export function CenterMorphModal({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange]
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
    }),
    [id, open, setOpen]
  );

  return (
    <CenterMorphModalContext.Provider value={value}>
      {children}
    </CenterMorphModalContext.Provider>
  );
}

/**
 * CenterMorphModalTrigger - Wraps interactive element that opens/toggles modal
 */
export function CenterMorphModalTrigger({ children }) {
  const context = useCenterMorphModalContext("CenterMorphModalTrigger");
  if (!isValidElement(children)) return children;

  const childOnClick = children.props.onClick;

  return cloneElement(children, {
    id: context.triggerId,
    onClick: (event) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) context.setOpen(!context.open);
    },
    "aria-haspopup": "dialog",
    "aria-expanded": context.open,
    "aria-controls": context.open ? context.contentId : undefined,
  });
}

/**
 * CenterMorphModalClose - Wraps interactive element that closes the modal
 */
export function CenterMorphModalClose({ children }) {
  const context = useCenterMorphModalContext("CenterMorphModalClose");
  if (!isValidElement(children)) return children;

  const childOnClick = children.props.onClick;

  return cloneElement(children, {
    onClick: (event) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) context.setOpen(false);
    },
  });
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const CENTER_FOLDED_CLIP = "inset(48% 48% 48% 48% round 24px)";
const CENTER_OPEN_CLIP = "inset(0% 0% 0% 0% round 24px)";

const CENTER_UNFOLD_EASE = [0.2, 0, 0.2, 1];
const CENTER_UNFOLD_TRANSITION = {
  duration: 0.38,
  ease: CENTER_UNFOLD_EASE,
};

function getFocusableElements(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0
  );
}

/**
 * CenterMorphModalContent - Modal dialog content rendered in portal with center morph unfold animation
 */
export function CenterMorphModalContent({
  children,
  ariaLabel = "Dialog",
  ariaDescribedBy,
  dismissible = true,
  showCloseButton = true,
  closeButtonLabel = "Close modal",
  className = "",
  backdropClassName = "",
}) {
  const context = useCenterMorphModalContext("CenterMorphModalContent");
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!context.open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      const [firstFocusable] = getFocusableElements(panelRef.current);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        context.setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [context.open, context, dismissible]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {context.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            aria-label="Dismiss modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduce ? 0.1 : 0.25,
              ease: "easeOut",
            }}
            onClick={() => {
              if (dismissible) context.setOpen(false);
            }}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm cursor-default ${backdropClassName}`}
          />

          {/* Morphing Modal Panel */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center pointer-events-none">
            <motion.div
              ref={panelRef}
              id={context.contentId}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
              tabIndex={-1}
              initial={
                reduce
                  ? { opacity: 0, scale: 0.95 }
                  : { opacity: 0, clipPath: CENTER_FOLDED_CLIP, scale: 0.96 }
              }
              animate={{
                opacity: 1,
                clipPath: CENTER_OPEN_CLIP,
                scale: 1,
              }}
              exit={
                reduce
                  ? { opacity: 0, scale: 0.95 }
                  : {
                      opacity: 0,
                      clipPath: CENTER_FOLDED_CLIP,
                      scale: 0.96,
                    }
              }
              transition={
                reduce
                  ? { duration: 0.15, ease: "easeOut" }
                  : CENTER_UNFOLD_TRANSITION
              }
              className={`pointer-events-auto relative w-full origin-center overflow-hidden rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-6 shadow-[8px_8px_0px_0px_var(--line)] will-change-[clip-path,transform,opacity] ${className}`}
            >
              {children}

              {showCloseButton && (
                <motion.button
                  type="button"
                  aria-label={closeButtonLabel}
                  onClick={() => context.setOpen(false)}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: reduce ? 1 : 0.85,
                    transition: { duration: 0.1 },
                  }}
                  transition={{
                    delay: reduce ? 0 : 0.15,
                    duration: reduce ? 0.12 : 0.2,
                    ease: "easeOut",
                  }}
                  className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-xl border border-[var(--line)]/20 bg-[var(--surface-muted)] text-[var(--secondary-text)] hover:text-[var(--primary-text)] hover:border-[var(--line)] transition-colors cursor-pointer"
                >
                  <X className="size-4" aria-hidden="true" />
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default CenterMorphModal;
