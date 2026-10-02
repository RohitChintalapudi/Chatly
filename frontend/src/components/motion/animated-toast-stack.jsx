import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Info, Sparkles, X } from "lucide-react";
import { useToaster, toast as hotToast, resolveValue } from "react-hot-toast";
import { cn } from "../../lib/utils";

/**
 * Status icons configuration with sleek, theme-aligned icons.
 */
const STATUS_ICONS = {
  loading: <Loader2 className="size-4 animate-spin text-[var(--accent)] stroke-[2.5]" />,
  success: <CheckCircle2 className="size-4 text-emerald-500 dark:text-emerald-400 stroke-[2.5]" />,
  error: <AlertCircle className="size-4 text-rose-500 dark:text-rose-400 stroke-[2.5]" />,
  info: <Info className="size-4 text-sky-500 dark:text-sky-400 stroke-[2.5]" />,
  neutral: <Sparkles className="size-4 text-[var(--accent)] stroke-[2.5]" />,
};

const STATUS_ACCENT_CLASSES = {
  loading: "border-l-[var(--accent)]",
  success: "border-l-emerald-500",
  error: "border-l-rose-500",
  info: "border-l-sky-500",
  neutral: "border-l-[var(--accent)]",
};

/**
 * PillButton helper component matching the motion design system.
 */
export function PillButton({ onClick, children, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "rounded-full border border-black/15 dark:border-white/15 px-3 py-1 text-xs font-semibold text-[var(--primary-text)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] hover:border-[var(--line)] active:scale-[0.96] transition-all shadow-[1px_1px_0px_0px_var(--line)] cursor-pointer select-none",
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * Hook for managing animated toast stacks with support for limits, auto-dismiss, and status morphing.
 */
export function useAnimatedToastStack({ limit = 4, defaultDuration = 4200 } = {}) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const showToast = useCallback(
    ({
      id: customId,
      status = "neutral",
      title = "",
      description = null,
      duration = defaultDuration,
      action = null,
      icon = null,
      ...rest
    }) => {
      const id = customId || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      if (timersRef.current.has(id)) {
        clearTimeout(timersRef.current.get(id));
        timersRef.current.delete(id);
      }

      if (duration && duration > 0 && duration !== Infinity) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      const newToast = {
        id,
        status,
        title,
        description,
        duration,
        action,
        icon,
        createdAt: Date.now(),
        ...rest,
      };

      setToasts((prev) => {
        const exists = prev.some((t) => t.id === id);
        if (exists) {
          return prev.map((t) => (t.id === id ? { ...t, ...newToast } : t));
        }
        const updated = [newToast, ...prev];
        return updated.slice(0, limit);
      });

      return id;
    },
    [defaultDuration, dismissToast, limit]
  );

  const updateToast = useCallback(
    (id, updates) => {
      if (timersRef.current.has(id)) {
        clearTimeout(timersRef.current.get(id));
        timersRef.current.delete(id);
      }

      const duration = updates.duration !== undefined ? updates.duration : defaultDuration;
      if (duration && duration > 0 && duration !== Infinity) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    [defaultDuration, dismissToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    toasts,
    showToast,
    updateToast,
    dismissToast,
    clearToasts,
  };
}

/**
 * Single Toast Item Card with spring layout, gesture swipe-to-dismiss, and status transitions.
 */
export function ToastCard({
  toast,
  index,
  total,
  isHovered,
  onDismiss,
  isTop = true,
  limit = 4,
}) {
  const { id, status = "neutral", title, description, action, icon } = toast;
  const statusIcon = icon || STATUS_ICONS[status] || STATUS_ICONS.neutral;
  const accentBorder = STATUS_ACCENT_CLASSES[status] || STATUS_ACCENT_CLASSES.neutral;

  // Stacking transform calculations:
  // When collapsed: offset and scale down deeper cards
  // When hovered: expand into a neat vertical list
  const collapsedY = isTop ? index * 10 : -index * 10;
  const collapsedScale = Math.max(0.85, 1 - index * 0.05);
  const collapsedOpacity = index === 0 ? 1 : Math.max(0.4, 0.9 - index * 0.2);

  const expandedY = isTop ? index * 72 : -index * 72;
  const expandedScale = 1;
  const expandedOpacity = 1;

  const targetY = isHovered ? expandedY : collapsedY;
  const targetScale = isHovered ? expandedScale : collapsedScale;
  const targetOpacity = isHovered ? expandedOpacity : collapsedOpacity;
  const zIndex = limit - index;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: isTop ? -25 : 25,
        scale: 0.9,
      }}
      animate={{
        opacity: targetOpacity,
        y: targetY,
        scale: targetScale,
        transition: {
          type: "spring",
          stiffness: 380,
          damping: 28,
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.85,
        y: isTop ? -20 : 20,
        transition: { duration: 0.18, ease: "easeOut" },
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 400) {
          onDismiss?.(id);
        }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        zIndex,
        position: index === 0 ? "relative" : "absolute",
        top: isTop ? 0 : "auto",
        bottom: isTop ? "auto" : 0,
      }}
      className={cn(
        "pointer-events-auto w-full max-w-[380px] min-w-[280px] sm:min-w-[320px] select-none",
        "bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] rounded-2xl p-3.5",
        "shadow-[4px_4px_0px_0px_var(--line)] backdrop-blur-md transition-shadow",
        "border-l-4",
        accentBorder
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Morphing Icon */}
        <motion.div
          key={status}
          initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="mt-0.5 shrink-0"
        >
          {statusIcon}
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-1">
          {title && (
            <motion.div
              layout="position"
              className="text-xs sm:text-sm font-black text-[var(--primary-text)] leading-snug break-words"
            >
              {title}
            </motion.div>
          )}
          {description && (
            <motion.div
              layout="position"
              className="text-[11px] sm:text-xs text-[var(--secondary-text)] mt-0.5 font-medium leading-normal break-words"
            >
              {description}
            </motion.div>
          )}

          {/* Action Button */}
          {action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.(e);
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[var(--accent)] text-black border border-[var(--line)] shadow-[1.5px_1.5px_0px_0px_var(--line)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95 transition-all cursor-pointer"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.(id);
          }}
          aria-label="Dismiss toast"
          className="shrink-0 p-1 rounded-lg text-[var(--secondary-text)] hover:text-[var(--primary-text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
        >
          <X className="size-3.5 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * AnimatedToastStack presentation component.
 */
export function AnimatedToastStack({
  toasts = [],
  onDismiss,
  placement = "fixed",
  position = "top-center",
  limit = 4,
  expandOnHover = true,
  className = "",
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isTop = position.startsWith("top");

  const positionClasses = {
    "top-center": "top-5 left-1/2 -translate-x-1/2 items-center",
    "top-right": "top-5 right-5 items-end",
    "top-left": "top-5 left-5 items-start",
    "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-5 right-5 items-end",
    "bottom-left": "bottom-5 left-5 items-start",
  };

  const containerClass =
    placement === "fixed"
      ? cn(
          "fixed z-50 pointer-events-none flex flex-col transition-all duration-200",
          positionClasses[position] || positionClasses["top-center"],
          className
        )
      : cn("relative flex flex-col items-center justify-center w-full", className);

  // Sliced to visible limit
  const visibleToasts = toasts.slice(0, limit);

  return (
    <div
      className={containerClass}
      onMouseEnter={() => expandOnHover && setIsHovered(true)}
      onMouseLeave={() => expandOnHover && setIsHovered(false)}
    >
      <div className="relative flex flex-col items-center w-full max-w-[380px]">
        <AnimatePresence mode="popLayout">
          {visibleToasts.map((toast, index) => (
            <ToastCard
              key={toast.id}
              toast={toast}
              index={index}
              total={visibleToasts.length}
              isHovered={isHovered}
              onDismiss={onDismiss}
              isTop={isTop}
              limit={limit}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * AnimatedToaster: Global adapter connecting react-hot-toast to AnimatedToastStack.
 */
export function AnimatedToaster({
  position = "top-center",
  limit = 4,
  defaultDuration = 3500,
}) {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  // Filter visible toasts and map them to AnimatedToastStack items
  const mappedToasts = toasts
    .filter((t) => t.visible)
    .slice(0, limit)
    .map((t) => {
      let status = "neutral";
      if (t.type === "success") status = "success";
      else if (t.type === "error") status = "error";
      else if (t.type === "loading") status = "loading";
      else if (t.type === "blank" || t.type === "custom") status = "neutral";

      const messageContent = resolveValue(t.message, t);

      let title = messageContent;
      let description = null;
      let action = null;

      if (
        messageContent &&
        typeof messageContent === "object" &&
        !React.isValidElement(messageContent)
      ) {
        title = messageContent.title || messageContent.message || "";
        description = messageContent.description || null;
        action = messageContent.action || null;
      }

      return {
        id: t.id,
        status,
        title,
        description,
        duration: t.duration || defaultDuration,
        icon: t.icon,
        action,
        ariaProps: t.ariaProps,
      };
    });

  return (
    <div onMouseEnter={startPause} onMouseLeave={endPause}>
      <AnimatedToastStack
        toasts={mappedToasts}
        onDismiss={(id) => hotToast.dismiss(id)}
        position={position}
        placement="fixed"
        limit={limit}
      />
    </div>
  );
}

export { AnimatedToaster as Toaster };
export default AnimatedToastStack;
