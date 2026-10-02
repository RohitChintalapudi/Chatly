import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * SkeletonReveal component.
 * Displays a pulsing skeleton placeholder during loading and seamlessly cross-fades & un-blurs into the actual content.
 */
export function SkeletonReveal({
  loading = false,
  skeleton,
  children,
  pulseCount,
  pulseDuration = 900,
  transitionDuration = 0.35,
  className = "",
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0.8 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              transition: {
                repeat: pulseCount !== undefined ? pulseCount : Infinity,
                duration: pulseDuration / 1000,
                ease: "easeInOut",
              },
            }}
            exit={{
              opacity: 0,
              filter: "blur(3px)",
              transition: { duration: transitionDuration * 0.7, ease: "easeOut" },
            }}
            className="w-full"
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.99 }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              transition: { duration: transitionDuration, ease: [0.22, 1, 0.36, 1] },
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SkeletonReveal;
