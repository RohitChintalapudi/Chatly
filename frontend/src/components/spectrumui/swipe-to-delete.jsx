import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * SwipeToDelete component.
 * Allows dragging a row left to reveal delete action or swipe-to-delete with animations.
 */
export function SwipeToDelete({
  children,
  onDelete,
  label = "item",
  className = "",
  disabled = false,
  deleteThreshold = -80,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [0, -40, deleteThreshold], [0, 0.6, 1]);
  const deleteScale = useTransform(x, [0, deleteThreshold], [0.85, 1]);

  const handleDelete = () => {
    if (disabled || isDeleting) return;
    setIsDeleting(true);
  };

  const handleDragEnd = (_, info) => {
    if (disabled) return;
    if (info.offset.x <= deleteThreshold || info.velocity.x < -300) {
      handleDelete();
    }
  };

  return (
    <AnimatePresence>
      {!isDeleting ? (
        <motion.div
          layout
          initial={{ opacity: 1, height: "auto" }}
          exit={{
            opacity: 0,
            height: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            transition: { duration: 0.25, ease: "easeInOut" },
          }}
          onAnimationComplete={() => {
            if (isDeleting) {
              onDelete?.();
            }
          }}
          className={cn("relative overflow-hidden rounded-2xl select-none group", className)}
          role="group"
          aria-label={label}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Delete Action Zone */}
          <div
            className="absolute inset-0 bg-rose-500 text-white rounded-2xl flex items-center justify-end pr-5 gap-2 font-bold text-xs shadow-inner cursor-pointer"
            onClick={handleDelete}
          >
            <motion.div
              style={{ opacity: deleteOpacity, scale: deleteScale }}
              className="flex items-center gap-1.5 font-black uppercase tracking-wider"
            >
              <Trash2 className="size-4 stroke-[2.5]" />
              <span>Delete</span>
            </motion.div>
          </div>

          {/* Foreground Draggable Content Card */}
          <motion.div
            style={{ x }}
            drag={disabled ? false : "x"}
            dragConstraints={{ left: -100, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                handleDelete();
              }
            }}
            tabIndex={0}
            className={cn(
              "relative z-10 bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] rounded-2xl",
              "shadow-[3px_3px_0px_0px_var(--line)] hover:shadow-[4px_4px_0px_0px_var(--line)] transition-shadow",
              "cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default SwipeToDelete;
