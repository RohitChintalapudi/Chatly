import { Alert } from "../ui/alert";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { PartyPopper, X } from "lucide-react";

const variantStyles = {
  violet: {
    alert:
      "bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-zinc-950 border-violet-200/80 dark:border-violet-900/50 shadow-[0_1px_6px_0_rgba(139,92,246,0.08)]",
    iconBg:
      "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 dark:from-fuchsia-600 dark:via-violet-600 dark:to-indigo-600",
    title: "text-violet-950 dark:text-violet-100",
    description: "text-violet-700 dark:text-violet-300",
    badge:
      "bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-indigo-500/10 dark:from-fuchsia-500/20 dark:via-violet-500/20 dark:to-indigo-500/20 text-violet-700 dark:text-violet-200 ring-1 ring-violet-500/20 dark:ring-violet-400/20",
    confetti1: "bg-fuchsia-400 dark:bg-fuchsia-600/30",
    confetti2: "bg-violet-400 dark:bg-violet-600/30",
    confetti3: "bg-indigo-400 dark:bg-indigo-600/30",
  },
  emerald: {
    alert:
      "bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-950 border-emerald-200/80 dark:border-emerald-900/50 shadow-[0_1px_6px_0_rgba(16,185,129,0.08)]",
    iconBg:
      "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600",
    title: "text-emerald-950 dark:text-emerald-100",
    description: "text-emerald-700 dark:text-emerald-300",
    badge:
      "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/20 dark:ring-emerald-400/20",
    confetti1: "bg-emerald-400 dark:bg-emerald-600/30",
    confetti2: "bg-teal-400 dark:bg-teal-600/30",
    confetti3: "bg-cyan-400 dark:bg-cyan-600/30",
  },
  amber: {
    alert:
      "bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-zinc-950 border-amber-200/80 dark:border-amber-900/50 shadow-[0_1px_6px_0_rgba(245,158,11,0.08)]",
    iconBg:
      "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 dark:from-amber-600 dark:via-orange-600 dark:to-yellow-600",
    title: "text-amber-950 dark:text-amber-100",
    description: "text-amber-700 dark:text-amber-300",
    badge:
      "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-200 ring-1 ring-amber-500/20 dark:ring-amber-400/20",
    confetti1: "bg-amber-400 dark:bg-amber-600/30",
    confetti2: "bg-orange-400 dark:bg-orange-600/30",
    confetti3: "bg-yellow-400 dark:bg-yellow-600/30",
  },
  cyan: {
    alert:
      "bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/30 dark:to-zinc-950 border-cyan-200/80 dark:border-cyan-900/50 shadow-[0_1px_6px_0_rgba(6,182,212,0.08)]",
    iconBg:
      "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 dark:from-cyan-600 dark:via-blue-600 dark:to-indigo-600",
    title: "text-cyan-950 dark:text-cyan-100",
    description: "text-cyan-700 dark:text-cyan-300",
    badge:
      "bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 dark:from-cyan-500/20 dark:via-blue-500/20 dark:to-indigo-500/20 text-cyan-700 dark:text-cyan-200 ring-1 ring-cyan-500/20 dark:ring-cyan-400/20",
    confetti1: "bg-cyan-400 dark:bg-cyan-600/30",
    confetti2: "bg-blue-400 dark:bg-blue-600/30",
    confetti3: "bg-indigo-400 dark:bg-indigo-600/30",
  },
};

export function AchievementMilestone({
  title = "Amazing milestone! 🎉",
  description = "You've just hit 1,000 followers on your journey!",
  badgeText = "Milestone",
  icon,
  variant = "violet",
  className = "",
  onDismiss,
  action,
}) {
  const currentVariant = variantStyles[variant] || variantStyles.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      className={cn("w-full max-w-xl mx-auto", className)}
    >
      <Alert
        className={cn(
          "relative overflow-hidden",
          currentVariant.alert,
          "rounded-2xl p-4 sm:p-5 border-2",
          className
        )}
      >
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 pr-16 sm:pr-20">
          <motion.div
            initial={{ rotate: -15, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="shrink-0"
          >
            <div className={cn("p-2.5 sm:p-3 rounded-2xl shadow-sm", currentVariant.iconBg)}>
              {icon ?? <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            </div>
          </motion.div>

          <div className="space-y-0.5">
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={cn("font-extrabold text-sm sm:text-base tracking-tight", currentVariant.title)}
            >
              {title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn("text-xs sm:text-sm font-medium leading-relaxed", currentVariant.description)}
            >
              {description}
            </motion.p>
            {action && <div className="mt-2 pt-1">{action}</div>}
          </div>
        </div>

        {/* Confetti ambient glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={cn(
              "absolute -left-2 -top-2 h-16 w-16 rounded-full blur-2xl opacity-25",
              currentVariant.confetti1
            )}
          />
          <div
            className={cn(
              "absolute top-2 right-8 h-12 w-12 rounded-full blur-2xl opacity-25",
              currentVariant.confetti2
            )}
          />
          <div
            className={cn(
              "absolute -right-2 -bottom-2 h-16 w-16 rounded-full blur-2xl opacity-25",
              currentVariant.confetti3
            )}
          />
        </div>

        {/* Top Right Celebration Badge & Optional Dismiss */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          {badgeText && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.3,
              }}
              className={cn(
                "text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none",
                currentVariant.badge
              )}
            >
              {badgeText}
            </motion.div>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss milestone"
              className="p-1 rounded-full text-[var(--secondary-text)] hover:text-[var(--primary-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </Alert>
    </motion.div>
  );
}

// Default export compatible with Alertdemo naming
export const Alertdemo = AchievementMilestone;
export default AchievementMilestone;
