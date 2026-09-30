import {
  Children,
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

// Soft spring for momentum glide after release
const GLIDE_SPRING = { stiffness: 45, damping: 22, mass: 2.8 };
const FLICK_MOMENTUM = 0.45;
const MAX_FLICK_ITEMS = 5;

// The frame edge sits at this wall angle; how far the wall curves in frame.
const THETA_EDGE = (72 * Math.PI) / 180;
// Wall angle past which an item is hidden
const THETA_CLAMP = (95 * Math.PI) / 180;

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
 * One item card on the cylinder wall, rendered through perspective projection
 */
function CarouselBall({
  scroll,
  index,
  count,
  alpha,
  k,
  projection,
  gap,
  edgeOffset,
  minScale,
  convex,
  arc,
  halfWidth,
  itemWidth,
  itemHeight,
  onSelect,
  children,
}) {
  // Nearest wrapped offset so items loop around continuously
  const offset = useTransform(scroll, (s) => {
    let o = index - s;
    o -= Math.round(o / count) * count;
    return o;
  });

  const x = useTransform(offset, (o) => {
    if (convex) return o * gap;
    const th = Math.max(-THETA_CLAMP, Math.min(THETA_CLAMP, o * alpha));
    return (projection * Math.sin(th)) / (Math.cos(th) + k);
  });

  const scale = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    const t = Math.min(dist / edgeOffset, 1.2);
    return convex ? 1 - (1 - minScale) * t : minScale + (1 - minScale) * t;
  });

  const y = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    // Smooth convex parabolic arch: center item is highest (0), sides descend naturally
    const archOffset = dist * dist * (convex ? 10 : -12);
    return archOffset;
  });

  const opacity = useTransform(offset, (o) => {
    const dist = Math.abs(o);
    if (dist > edgeOffset + 0.8) return 0;
    if (dist > 1.8) return Math.max(0, 1 - (dist - 1.8) * 1.2);
    return 1;
  });

  const zIndex = useTransform(scale, (s) => Math.round(s * 100));

  const visibility = useTransform(x, (px) =>
    Math.abs(px) > halfWidth + itemWidth + 50 ? "hidden" : "visible"
  );

  return (
    <motion.div
      onClick={onSelect}
      className="absolute top-1/2 left-1/2 select-none cursor-pointer"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        visibility,
        width: itemWidth,
        height: itemHeight,
        marginLeft: -itemWidth / 2,
        marginTop: -itemHeight / 2,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CylinderCarousel Component
 */
export function CylinderCarousel({
  children,
  itemWidth = 310,
  itemHeight = 390,
  visibleItems = 5,
  variant = "convex",
  minScale = 0.8,
  dragSpeed = 1.3,
  arc: arcProp,
  snap = true,
  autoRotate = true,
  autoRotateSpeed = 0.22,
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

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stageWidth = width || 900;
  const halfWidth = stageWidth / 2;
  const edgeOffset = (visibleItems + 1) / 2;

  const convex = variant === "convex";
  
  // Responsive card dimensions and generous gap between each feature card
  const finalItemWidth = Math.min(itemWidth, Math.max(260, stageWidth * 0.8 / (visibleItems > 3 ? 3.2 : 1.4)));
  const finalItemHeight = itemHeight;

  // Clear horizontal gap between cards so each feature stands apart with ample breathing room
  const gap = finalItemWidth + 36;
  const arc = arcProp ?? (convex ? 25 : 35);

  const alpha = THETA_EDGE / edgeOffset;
  const k = Math.max(0.2, (minScale - Math.cos(THETA_EDGE)) / (1 - minScale));
  const projection =
    (halfWidth * (Math.cos(THETA_EDGE) + k)) / Math.sin(THETA_EDGE);

  const scroll = useMotionValue(defaultIndex);
  const indexRef = useRef(defaultIndex);
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const glideRef = useRef(null);
  const draggingRef = useRef(false);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (count === 0) return;
    const unsub = scroll.on("change", (v) => {
      const idx = ((Math.round(v) % count) + count) % count;
      if (idx !== indexRef.current) {
        indexRef.current = idx;
        setCurrentIndex(idx);
        onIndexChange?.(idx);
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

  useEffect(() => {
    if (!autoRotate || reduce || count === 0) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!draggingRef.current && !hoverRef.current && !glideRef.current) {
        scroll.set(scroll.get() + autoRotateSpeed * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate, autoRotateSpeed, reduce, count, scroll]);

  const stageHeight = height ?? (finalItemHeight + 60);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Curved Perspective Stage */}
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
        style={{ height: stageHeight }}
      >
        {items.map((item, i) => (
          <CarouselBall
            key={i}
            scroll={scroll}
            index={i}
            count={count}
            alpha={alpha}
            k={k}
            projection={projection}
            gap={gap}
            edgeOffset={edgeOffset}
            minScale={minScale}
            convex={convex}
            arc={arc}
            halfWidth={halfWidth}
            itemWidth={finalItemWidth}
            itemHeight={finalItemHeight}
            onSelect={() => {
              // Smoothly glide clicked item to center
              const currentS = scroll.get();
              const nearest = Math.round(currentS);
              let diff = i - (nearest % count);
              if (diff > count / 2) diff -= count;
              if (diff < -count / 2) diff += count;
              glideTo(nearest + diff);
            }}
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

        {/* Feature Index Indicators */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)]">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const currentS = scroll.get();
                const nearest = Math.round(currentS);
                let diff = i - (nearest % count);
                if (diff > count / 2) diff -= count;
                if (diff < -count / 2) diff += count;
                glideTo(nearest + diff);
              }}
              aria-label={`Jump to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === i
                  ? "w-7 bg-[var(--accent)] border border-[var(--line)]"
                  : "w-2.5 bg-[var(--line)]/20 hover:bg-[var(--line)]/50"
              }`}
            />
          ))}
        </div>

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
