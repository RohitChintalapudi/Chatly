import {
  Children,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

// Soft spring with optimal damping for smooth 60/120fps glide
const GLIDE_SPRING = { stiffness: 55, damping: 26, mass: 2.2 };
const FLICK_MOMENTUM = 0.38;
const MAX_FLICK_ITEMS = 4;

function capturePointer(el, id) {
  try {
    el.setPointerCapture(id);
  } catch (e) {}
}

function releasePointer(el, id) {
  try {
    el.releasePointerCapture(id);
  } catch (e) {}
}

/**
 * High-performance, GPU-accelerated card item
 * Rendered using 3D hardware transforms (translate3d, preserve-3d) to bypass
 * browser layout thrashing and z-index recalculations.
 */
const CarouselBall = memo(function CarouselBall({
  scroll,
  index,
  count,
  gap,
  minScale,
  halfWidth,
  itemWidth,
  itemHeight,
  onSelect,
  children,
}) {
  // Nearest wrapped offset so items loop around continuously without jumps
  const offset = useTransform(scroll, (s) => {
    let o = index - s;
    o -= Math.round(o / count) * count;
    return o;
  });

  // Direct GPU-accelerated horizontal slot position
  const x = useTransform(offset, (o) => o * gap);

  // Smooth parabolic convex arch: center card at highest elevation (0), side cards curve down
  const y = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    return dist * dist * 10;
  });

  // Convex Scale: Center card reaches 1.0, side cards smoothly scale down
  const scale = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    const factor = Math.min(dist / 2.4, 1);
    return 1 - (1 - minScale) * factor;
  });

  // 3D Depth Layering on GPU: center card is closest in z-space (translateZ: 60px)
  const z = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    return Math.max(0, (1 - dist / 2.4) * 60);
  });

  // Fade out cards at the periphery
  const opacity = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    if (dist > 2.6) return 0;
    if (dist > 1.6) return Math.max(0, 1 - (dist - 1.6) * 1.4);
    return 1;
  });

  // Prevent interactions on peripheral clipped cards
  const pointerEvents = useTransform(offset, (o) =>
    Math.abs(o) > 2.2 ? "none" : "auto"
  );

  return (
    <motion.div
      onClick={onSelect}
      className="absolute top-1/2 left-1/2 select-none cursor-pointer will-change-transform"
      style={{
        x,
        y,
        z,
        scale,
        opacity,
        pointerEvents,
        width: itemWidth,
        height: itemHeight,
        marginLeft: -itemWidth / 2,
        marginTop: -itemHeight / 2,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {children}
    </motion.div>
  );
});

/**
 * Isolated Dots Navigation Indicator
 * Tracks active index locally to prevent re-rendering the parent carousel during animation
 */
const CarouselDots = memo(function CarouselDots({ scroll, count, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsub = scroll.on("change", (v) => {
      const idx = ((Math.round(v) % count) + count) % count;
      setActiveIndex(idx);
    });
    return unsub;
  }, [scroll, count]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)]">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Jump to slide ${i + 1}`}
          className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
            activeIndex === i
              ? "w-7 bg-[var(--accent)] border border-[var(--line)]"
              : "w-2.5 bg-[var(--line)]/20 hover:bg-[var(--line)]/50"
          }`}
        />
      ))}
    </div>
  );
});

/**
 * Ultra-Smooth CylinderCarousel Component
 * - 0 React re-renders during motion
 * - Pure GPU compositor execution via translate3d / preserve-3d
 * - Auto-pauses offscreen via IntersectionObserver
 */
export function CylinderCarousel({
  children,
  itemWidth = 320,
  itemHeight = 390,
  visibleItems = 5,
  variant = "convex",
  minScale = 0.82,
  dragSpeed = 1.2,
  snap = true,
  autoRotate = true,
  autoRotateSpeed = 0.2,
  defaultIndex = 0,
  onIndexChange,
  height,
  className = "",
}) {
  const reduce = useReducedMotion() ?? false;
  const items = Children.toArray(children);
  const count = items.length;

  const stageRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isInView, setIsInView] = useState(true);

  // ResizeObserver for responsive width
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // IntersectionObserver to pause RAF when out of viewport
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stageWidth = width || 900;
  const halfWidth = stageWidth / 2;

  // Responsive card dimension & generous spacing gap
  const finalItemWidth = Math.min(
    itemWidth,
    Math.max(260, (stageWidth * 0.82) / (visibleItems > 3 ? 3.2 : 1.4))
  );
  const finalItemHeight = itemHeight;
  const gap = finalItemWidth + 36;

  const scroll = useMotionValue(defaultIndex);
  const glideRef = useRef(null);
  const draggingRef = useRef(false);
  const hoverRef = useRef(false);

  // Optional external index change callback (debounced/throttled)
  const indexRef = useRef(defaultIndex);
  useEffect(() => {
    if (!onIndexChange || count === 0) return;
    const unsub = scroll.on("change", (v) => {
      const idx = ((Math.round(v) % count) + count) % count;
      if (idx !== indexRef.current) {
        indexRef.current = idx;
        onIndexChange(idx);
      }
    });
    return unsub;
  }, [scroll, count, onIndexChange]);

  const stopGlide = useCallback(() => {
    glideRef.current?.stop();
    glideRef.current = null;
  }, []);

  const glideTo = useCallback(
    (to, velocity = 0) => {
      stopGlide();
      if (reduce) {
        scroll.set(to);
        return;
      }
      glideRef.current = animate(scroll, to, {
        type: "spring",
        ...GLIDE_SPRING,
        velocity,
        restDelta: 0.001,
        restSpeed: 0.005,
      });
    },
    [scroll, stopGlide, reduce]
  );

  const settle = useCallback(
    (velocity) => {
      const projected =
        scroll.get() +
        Math.max(
          -MAX_FLICK_ITEMS,
          Math.min(MAX_FLICK_ITEMS, velocity * FLICK_MOMENTUM)
        );
      glideTo(snap ? Math.round(projected) : projected, velocity);
    },
    [scroll, snap, glideTo]
  );

  const selectIndex = useCallback(
    (targetIndex) => {
      const currentS = scroll.get();
      const nearest = Math.round(currentS);
      let diff = targetIndex - (nearest % count);
      if (diff > count / 2) diff -= count;
      if (diff < -count / 2) diff += count;
      glideTo(nearest + diff);
    },
    [scroll, count, glideTo]
  );

  const drag = useRef({
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    prevX: 0,
    prevT: 0,
  });

  const onPointerDown = useCallback(
    (e) => {
      stopGlide();
      draggingRef.current = true;
      capturePointer(e.currentTarget, e.pointerId);
      const now = performance.now();
      drag.current = {
        startX: e.clientX,
        startScroll: scroll.get(),
        lastX: e.clientX,
        lastT: now,
        prevX: e.clientX,
        prevT: now,
      };
    },
    [scroll, stopGlide]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      const d = drag.current;
      scroll.set(d.startScroll - ((e.clientX - d.startX) * dragSpeed) / gap);
      d.prevX = d.lastX;
      d.prevT = d.lastT;
      d.lastX = e.clientX;
      d.lastT = performance.now();
    },
    [scroll, gap, dragSpeed]
  );

  const onPointerUp = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      releasePointer(e.currentTarget, e.pointerId);
      const d = drag.current;
      const dt = d.lastT - d.prevT;
      const vpx = dt > 0 ? (d.lastX - d.prevX) / dt : 0;
      settle((-vpx * dragSpeed * 1000) / gap);
    },
    [settle, gap, dragSpeed]
  );

  const rollBy = useCallback(
    (dir) => {
      glideTo(Math.round(scroll.get()) + dir, scroll.getVelocity());
    },
    [scroll, glideTo]
  );

  const wheelSettleRef = useRef(undefined);
  const onWheel = useCallback(
    (e) => {
      stopGlide();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scroll.set(scroll.get() + delta / gap);
      if (wheelSettleRef.current) window.clearTimeout(wheelSettleRef.current);
      wheelSettleRef.current = window.setTimeout(
        () => settle(scroll.getVelocity()),
        140
      );
    },
    [scroll, gap, settle, stopGlide]
  );

  // Auto-rotation loop with RAF and delta-capping (active only when in viewport)
  useEffect(() => {
    if (!autoRotate || reduce || count === 0 || !isInView) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!draggingRef.current && !hoverRef.current && !glideRef.current) {
        scroll.set(scroll.get() + autoRotateSpeed * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate, autoRotateSpeed, reduce, count, scroll, isInView]);

  const stageHeight = height ?? finalItemHeight + 60;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Hardware Accelerated Perspective Stage */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            rollBy(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            rollBy(-1);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onPointerEnter={() => {
          hoverRef.current = true;
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
        }}
        className={`relative w-full touch-none outline-none overflow-visible cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${className}`}
        style={{
          height: stageHeight,
          perspective: 1200,
          perspectiveOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, i) => (
          <CarouselBall
            key={i}
            scroll={scroll}
            index={i}
            count={count}
            gap={gap}
            minScale={minScale}
            halfWidth={halfWidth}
            itemWidth={finalItemWidth}
            itemHeight={finalItemHeight}
            onSelect={() => selectIndex(i)}
          >
            {item}
          </CarouselBall>
        ))}
      </div>

      {/* Interactive Navigation HUD */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 z-20">
        <button
          type="button"
          onClick={() => rollBy(-1)}
          aria-label="Previous feature"
          className="size-10 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black flex items-center justify-center hover:bg-[var(--accent)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm active:translate-y-0"
        >
          ←
        </button>

        {/* Feature Index Indicators (isolated state for zero parent re-renders) */}
        <CarouselDots scroll={scroll} count={count} onSelect={selectIndex} />

        <button
          type="button"
          onClick={() => rollBy(1)}
          aria-label="Next feature"
          className="size-10 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-black flex items-center justify-center hover:bg-[var(--accent)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm active:translate-y-0"
        >
          →
        </button>
      </div>

      <p className="mt-2 text-[11px] font-mono font-bold text-[var(--secondary-text)] uppercase tracking-wider">
        Drag • Scroll • Click any card to focus
      </p>
    </div>
  );
}

export default CylinderCarousel;
