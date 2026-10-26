"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * Wraps a horizontally-scrollable area (the spec tables). On platforms with
 * classic scrollbars the native (styled, prominent) bar is enough. On platforms
 * with *overlay* scrollbars — hidden until you actively scroll, which made the
 * table look "cut off" — we render our own thin, always-visible horizontal
 * scrollbar pinned below the table. It's only shown when the native bar takes no
 * layout space, so the two never double up.
 */
export default function ScrollShadow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [bar, setBar] = useState({ show: false, width: 0, left: 0 });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // Native scrollbar occupies layout height only when it's a classic (not
    // overlay) bar — in that case it's already visible, so skip ours.
    const nativeVisible = el.offsetHeight - el.clientHeight > 0;
    const widthPct = (el.clientWidth / el.scrollWidth) * 100;
    const leftPct = max > 0 ? (el.scrollLeft / max) * (100 - widthPct) : 0;
    setBar({ show: max > 1 && !nativeVisible, width: widthPct, left: leftPct });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = scrollRef.current;
      const track = trackRef.current;
      if (!el || !track || !drag.current) return;
      const thumbPx = (el.clientWidth / el.scrollWidth) * track.clientWidth;
      const span = track.clientWidth - thumbPx; // px the thumb can travel
      const max = el.scrollWidth - el.clientWidth;
      if (span <= 0) return;
      el.scrollLeft = drag.current.left + ((e.clientX - drag.current.x) / span) * max;
    };
    const onUp = () => {
      drag.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onThumbDown = (e: ReactPointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    drag.current = { x: e.clientX, left: el.scrollLeft };
    document.body.style.userSelect = "none";
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className={`hd-table-scroll min-h-0 flex-1 overflow-auto ${className}`}
      >
        {children}
      </div>
      {bar.show && (
        <div className="shrink-0 px-2 pb-1.5 pt-1">
          <div ref={trackRef} className="relative h-2 rounded-full bg-surface-2">
            <div
              role="scrollbar"
              aria-orientation="horizontal"
              aria-label="Scroll table horizontally"
              onPointerDown={onThumbDown}
              className="absolute top-0 h-2 min-w-[24px] cursor-grab rounded-full bg-[var(--text-muted)] opacity-70 transition-opacity hover:opacity-100 active:cursor-grabbing active:opacity-100"
              style={{ width: `${bar.width}%`, left: `${bar.left}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
