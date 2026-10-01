import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const variantStyles = {
  primary:
    "bg-[var(--accent)] text-black font-black border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] hover:shadow-[1px_1px_0px_0px_var(--line)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
  secondary:
    "bg-[var(--surface-muted)] text-[var(--primary-text)] font-bold border-2 border-[var(--line)]/50 shadow-[2px_2px_0px_0px_var(--line)]/30 hover:border-[var(--line)] hover:bg-[var(--surface)] hover:shadow-[1px_1px_0px_0px_var(--line)]",
  destructive:
    "bg-red-500 text-white font-bold border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] hover:bg-red-600",
  outline:
    "bg-transparent text-[var(--primary-text)] font-bold border-2 border-[var(--line)] hover:bg-[var(--surface-muted)]",
  ghost:
    "bg-transparent text-[var(--primary-text)] font-medium hover:bg-[var(--surface-muted)]",
};

const sizeStyles = {
  sm: "h-9 px-3.5 py-1.5 text-xs rounded-xl",
  md: "h-10 px-4 py-2 text-sm rounded-2xl",
  lg: "h-12 px-6 py-3 text-base rounded-2xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={reduce || disabled ? undefined : { scale: 0.96, translateY: 1 }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0",
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function StatefulButton({
  children,
  state = "idle",
  loadingText = "Sending...",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const reduce = useReducedMotion();
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileTap={reduce || disabled || isLoading ? undefined : { scale: 0.96, translateY: 1 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-black transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0",
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {isLoading && (
        <Loader2 className="size-3.5 animate-spin stroke-[2.5]" />
      )}
      {isSuccess && (
        <Check className="size-3.5 stroke-[3] text-emerald-600 dark:text-emerald-400" />
      )}
      {isError && (
        <AlertCircle className="size-3.5 stroke-[2.5] text-red-500" />
      )}
      <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
        {isLoading ? loadingText : children}
      </span>
    </motion.button>
  );
}
