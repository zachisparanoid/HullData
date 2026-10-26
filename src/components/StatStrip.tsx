"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { useExplorerStore } from "@/store/useExplorerStore";
import { primaryVariant } from "@/lib/facets";
import { effectiveEndYear, lengthValue, lengthUnit, EM_DASH } from "@/lib/format";
import { HullTypeBadge } from "@/components/SpecBadge";
import type { BoatModelData, HullType } from "@/lib/types";

/** Animated number that rolls from its previous value over ~350ms. */
function CountUp({
  value,
  format,
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (reduce || prev.current === value) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  const f = format ?? ((n: number) => String(Math.round(n)));
  return <>{f(display)}</>;
}

function StatChip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-[6.5rem] flex-col gap-0.5 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="num text-sm font-semibold text-ink">{children}</span>
    </div>
  );
}

export default function StatStrip({ models }: { models: BoatModelData[] }) {
  const unit = useExplorerStore((s) => s.unit);

  const variantCount = models.reduce((a, m) => a + m.variants.length, 0);
  const loas = models.map((m) => primaryVariant(m).loaFt);
  const hps = models
    .map((m) => primaryVariant(m).totalHorsepower)
    .filter((n): n is number => n != null);
  const starts = models.map((m) => m.productionStartYear);
  const ends = models.map((m) => effectiveEndYear(m.productionEndYear));

  const hullCounts = new Map<HullType, number>();
  for (const m of models)
    hullCounts.set(m.hullType, (hullCounts.get(m.hullType) ?? 0) + 1);
  const topHull = Array.from(hullCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const has = models.length > 0;
  const u = lengthUnit(unit);

  return (
    <div className="flex flex-wrap items-stretch gap-2.5">
      <StatChip label="Models">
        <CountUp value={models.length} />
      </StatChip>
      <StatChip label="Variants">
        <CountUp value={variantCount} />
      </StatChip>
      <StatChip label="Year span">
        {has ? `${Math.min(...starts)}–${Math.max(...ends)}` : EM_DASH}
      </StatChip>
      <StatChip label={`LOA (${u})`}>
        {has ? (
          <>
            <CountUp
              value={Math.min(...loas)}
              format={(n) => lengthValue(n, unit)}
            />
            <span className="text-muted"> – </span>
            <CountUp
              value={Math.max(...loas)}
              format={(n) => lengthValue(n, unit)}
            />
          </>
        ) : (
          EM_DASH
        )}
      </StatChip>
      <StatChip label="Total HP">
        {hps.length ? (
          <>
            <CountUp value={Math.min(...hps)} />
            <span className="text-muted"> – </span>
            <CountUp value={Math.max(...hps)} />
          </>
        ) : (
          EM_DASH
        )}
      </StatChip>
      <StatChip label="Common hull">
        {topHull ? (
          <span className="inline-flex">
            <HullTypeBadge value={topHull} />
          </span>
        ) : (
          EM_DASH
        )}
      </StatChip>
    </div>
  );
}
