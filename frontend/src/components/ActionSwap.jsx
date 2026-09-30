import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import toast from "react-hot-toast";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const CASCADE_VARIANTS = {
  initial: (direction = 1) => ({
    opacity: 0,
    y: direction * 12,
    scale: 0.9,
  }),
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING_TRANSITION,
  },
  exit: (direction = 1) => ({
    opacity: 0,
    y: direction * -12,
    scale: 0.9,
    transition: { duration: 0.15, ease: "easeIn" },
  }),
};

/**
 * ActionSwapText - Cascading text label animation
 */
export function ActionSwapText({
  active,
  initialText = "Copy",
  swappedText = "Copied!",
  className = "",
  animation = "cascade",
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{active ? swappedText : initialText}</span>;
  }

  return (
    <span className={`relative inline-flex items-center overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={active ? "swapped" : "initial"}
          variants={CASCADE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={active ? 1 : -1}
          className="inline-block whitespace-nowrap"
        >
          {active ? swappedText : initialText}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * ActionSwapIcon - Cascading icon animation with scale and spin micro-interaction
 */
export function ActionSwapIcon({
  active,
  initialIcon: InitialIcon = Copy,
  swappedIcon: SwappedIcon = Check,
  className = "size-4",
  iconClassName = "",
  animation = "cascade",
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return active ? (
      <SwappedIcon className={`${className} ${iconClassName} text-green-500`} />
    ) : (
      <InitialIcon className={`${className} ${iconClassName}`} />
    );
  }

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={active ? "swapped" : "initial"}
          variants={CASCADE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={active ? 1 : -1}
          className="inline-flex items-center justify-center"
        >
          {active ? (
            <SwappedIcon className={`${className} ${iconClassName} text-green-500`} />
          ) : (
            <InitialIcon className={`${className} ${iconClassName}`} />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * ActionSwapButton - Base button component with action-swap transition
 */
export function ActionSwapButton({
  isSwapped,
  onAction,
  copyText,
  toastMessage = "Copied to clipboard!",
  duration = 2000,
  initialText = "Copy",
  swappedText = "Copied!",
  initialIcon = Copy,
  swappedIcon = Check,
  size = "md",
  variant = "default",
  className = "",
  showText = true,
  disabled = false,
  title,
  animation = "cascade",
  ...props
}) {
  const [internalActive, setInternalActive] = useState(false);
  const active = isSwapped !== undefined ? isSwapped : internalActive;

  const handleTrigger = useCallback(
    async (e) => {
      e?.stopPropagation();
      if (disabled) return;

      if (copyText) {
        try {
          await navigator.clipboard.writeText(copyText);
          if (toastMessage) {
            toast.success(toastMessage, {
              icon: "📋",
              style: {
                borderRadius: "12px",
                border: "2px solid var(--line)",
                background: "var(--surface)",
                color: "var(--primary-text)",
                fontWeight: 700,
                fontSize: "13px",
              },
            });
          }
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      }

      if (onAction) {
        onAction(e);
      }

      if (isSwapped === undefined) {
        setInternalActive(true);
      }
    },
    [copyText, toastMessage, onAction, isSwapped, disabled]
  );

  useEffect(() => {
    if (internalActive && isSwapped === undefined) {
      const timer = setTimeout(() => {
        setInternalActive(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [internalActive, isSwapped, duration]);

  // Sizing tokens
  const sizeClasses = {
    xs: "px-2.5 py-1 text-xs gap-1.5 rounded-lg",
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-xl",
    md: "px-4 py-2 text-sm gap-2 rounded-xl",
    lg: "px-5 py-2.5 text-base gap-2.5 rounded-2xl",
    icon: "p-2 rounded-xl",
    "icon-sm": "p-1.5 rounded-lg",
  }[size] || "px-3 py-2 text-xs gap-1.5 rounded-xl";

  // Variant tokens
  const variantClasses = {
    default:
      "border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] hover:bg-[var(--accent)]/10 hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 active:translate-y-0",
    accent:
      "border-2 border-[var(--line)] bg-[var(--accent)] text-[var(--primary-text)] font-extrabold hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 active:translate-y-0",
    outline:
      "border-2 border-[var(--line)]/30 bg-transparent text-[var(--primary-text)] hover:border-[var(--line)] hover:bg-[var(--surface-muted)]",
    ghost:
      "border border-transparent hover:border-[var(--line)] bg-transparent text-[var(--primary-text)] hover:bg-[var(--surface-muted)]",
  }[variant] || "";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={SPRING_TRANSITION}
      onClick={handleTrigger}
      disabled={disabled}
      title={title || (active ? swappedText : initialText)}
      className={`inline-flex items-center justify-center font-bold font-mono tracking-tight select-none transition-all cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      <ActionSwapIcon
        active={active}
        initialIcon={initialIcon}
        swappedIcon={swappedIcon}
        className={size === "icon-sm" || size === "xs" ? "size-3.5" : "size-4"}
      />
      {showText && (
        <ActionSwapText
          active={active}
          initialText={initialText}
          swappedText={swappedText}
        />
      )}
    </motion.button>
  );
}

/**
 * ActionSwapCascadeButton - Specialized cascade animation preset
 */
export function ActionSwapCascadeButton(props) {
  return <ActionSwapButton {...props} animation="cascade" />;
}

export function ActionSwapCascadeText(props) {
  return <ActionSwapText {...props} animation="cascade" />;
}

export function ActionSwapCascadeIcon(props) {
  return <ActionSwapIcon {...props} animation="cascade" />;
}

/**
 * CopyLinkButton - Quick ready-to-use button for shareable links
 */
export function CopyLinkButton({
  url,
  label = "Copy Link",
  copiedLabel = "Link Copied!",
  icon = Copy,
  ...props
}) {
  return (
    <ActionSwapCascadeButton
      copyText={url || (typeof window !== "undefined" ? window.location.href : "")}
      initialText={label}
      swappedText={copiedLabel}
      initialIcon={icon}
      swappedIcon={Check}
      toastMessage="Link copied to clipboard!"
      {...props}
    />
  );
}

/**
 * ShareLinkButton - Quick ready-to-use button for share links
 */
export function ShareLinkButton({
  url,
  title = "Chatly",
  label = "Share",
  copiedLabel = "Copied!",
  ...props
}) {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(shareUrl);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <ActionSwapCascadeButton
      onAction={handleShare}
      initialText={label}
      swappedText={copiedLabel}
      initialIcon={Share2}
      swappedIcon={Check}
      {...props}
    />
  );
}

export default ActionSwapCascadeButton;
