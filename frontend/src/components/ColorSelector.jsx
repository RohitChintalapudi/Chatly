import { createContext, useContext, useId, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 450,
  damping: 32,
};

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 25,
};

const ColorSelectorContext = createContext(null);

/**
 * ColorSelector Root Component
 */
export function ColorSelector({
  value,
  defaultValue = "",
  onValueChange,
  name,
  disabled = false,
  required = false,
  className = "",
  children,
  ...props
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  return (
    <ColorSelectorContext.Provider
      value={{
        value: current,
        select: (next) => {
          if (next === current) return;
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        },
        name: name ?? id,
        id,
        disabled,
        required,
      }}
    >
      <fieldset
        {...props}
        disabled={disabled}
        className={`min-w-0 border-0 p-0 ${className}`}
      >
        <LayoutGroup id={id}>{children}</LayoutGroup>
      </fieldset>
    </ColorSelectorContext.Provider>
  );
}

export function ColorSelectorLabel({ className = "", children, ...props }) {
  return (
    <legend
      {...props}
      className={`mb-2 p-0 text-sm font-extrabold text-[var(--primary-text)] ${className}`}
    >
      {children}
    </legend>
  );
}

export function ColorSelectorList({ className = "", children, ...props }) {
  return (
    <div
      {...props}
      className={`grid grid-cols-4 sm:grid-cols-8 gap-3 p-1.5 ${className}`}
    >
      {children}
    </div>
  );
}

export function ColorSelectorItem({
  value,
  color,
  label,
  isSaved = false,
  disabled = false,
  className = "",
  style,
  onChange,
  ...props
}) {
  const context = useContext(ColorSelectorContext);
  const reduce = useReducedMotion();

  if (!context) {
    throw new Error("ColorSelectorItem must be used within ColorSelector");
  }

  const selected = context.value === value;
  const unavailable = disabled || context.disabled;

  return (
    <motion.label
      tabIndex={-1}
      whileTap={reduce || unavailable ? undefined : { scale: 0.93 }}
      whileHover={reduce || unavailable ? undefined : { y: -2 }}
      transition={SPRING_PRESS}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-colors select-none ${
        unavailable
          ? "cursor-not-allowed opacity-40 border-[var(--line)]/10"
          : "cursor-pointer"
      } ${
        selected
          ? "border-[var(--line)] bg-[var(--surface-muted)] shadow-[3px_3px_0px_0px_var(--line)]"
          : "border-[var(--line)]/20 hover:border-[var(--line)]/60 bg-[var(--surface)] hover:shadow-[2px_2px_0px_0px_var(--line)]"
      } ${className}`}
    >
      {/* Accessible Radio Input */}
      <input
        {...props}
        type="radio"
        name={context.name}
        value={value}
        checked={selected}
        disabled={unavailable}
        required={context.required}
        aria-label={label}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.select(value);
        }}
        className="peer sr-only"
      />

      {/* Shared Sliding Spring Ring for Active Item */}
      {selected && (
        <motion.span
          layoutId={reduce ? undefined : `color-selection-${context.id}`}
          initial={false}
          transition={SPRING_LAYOUT}
          className="pointer-events-none absolute -inset-[3px] rounded-[18px] border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] z-10"
          style={{
            borderColor: "var(--line)",
          }}
        />
      )}

      {/* Swatch & Status Container */}
      <div className="relative flex items-center justify-center">
        {/* Animated Color Swatch Surface */}
        <div
          style={{ backgroundColor: color, ...style }}
          className="w-10 h-10 rounded-xl border-2 border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)] transition-transform duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]"
        />

        {/* Saved Theme Indicator Badge */}
        {isSaved && (
          <div 
            className="absolute -top-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-[var(--line)] flex items-center justify-center shadow-sm z-20"
            title="Current active saved accent"
          >
            <Check className="size-2.5 text-white" strokeWidth={3.5} />
          </div>
        )}
      </div>

      {/* Color Name Label */}
      <span className="text-[11px] font-mono font-bold text-[var(--primary-text)] tracking-tight">
        {label}
      </span>
    </motion.label>
  );
}

export default ColorSelector;
