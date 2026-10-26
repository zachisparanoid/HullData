"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useExplorerStore } from "@/store/useExplorerStore";
import { primaryVariant } from "@/lib/facets";
import {
  CategoryBadge,
  HullTypeBadge,
  PropulsionBadge,
  HullMaterialBadge,
} from "@/components/SpecBadge";
import Thumbnail from "@/components/Thumbnail";
import {
  formatLength,
  formatWeight,
  formatHp,
  formatSpeed,
  formatCapacity,
  formatRange,
  formatYears,
  formatEngines,
  EM_DASH,
} from "@/lib/format";
import type { GlobalBoat, UnitSystem } from "@/lib/types";
import type { ReactNode } from "react";

type Dir = "max" | "min" | "none";

interface Row {
  label: string;
  /** Comparable number (null = not applicable / missing). */
  get: (b: GlobalBoat) => number | null;
  /** Display cell. */
  render: (b: GlobalBoat, unit: UnitSystem, speedMph: boolean) => ReactNode;
  dir: Dir;
  /** Short superlative shown on the winning cell ("longest", "most HP"…). */
  best?: string;
}

const pv = primaryVariant;

const ROWS: Row[] = [
  {
    label: "Builder",
    get: () => null,
    dir: "none",
    render: (b) => <span className="text-ink">{b.manufacturerName}</span>,
  },
  {
    label: "Category",
    get: () => null,
    dir: "none",
    render: (b) => <CategoryBadge value={b.category} />,
  },
  {
    label: "Model years",
    get: () => null,
    dir: "none",
    render: (b) => formatYears(b.productionStartYear, b.productionEndYear),
  },
  {
    label: "Length (LOA)",
    get: (b) => pv(b).loaFt,
    dir: "max",
    best: "longest",
    render: (b, u) => formatLength(pv(b).loaFt, u),
  },
  {
    label: "Beam",
    get: (b) => pv(b).beamFt,
    dir: "max",
    best: "widest",
    render: (b, u) => formatLength(pv(b).beamFt, u),
  },
  {
    label: "Draft",
    get: (b) => pv(b).draftFt,
    dir: "min",
    best: "shallowest",
    render: (b, u) => formatLength(pv(b).draftFt, u),
  },
  {
    label: "Displacement",
    get: (b) => pv(b).displacementLbs,
    dir: "none",
    render: (b, u) =>
      pv(b).displacementLbs != null
        ? formatWeight(pv(b).displacementLbs, u)
        : EM_DASH,
  },
  {
    label: "Engines",
    get: () => null,
    dir: "none",
    render: (b) => {
      const v = pv(b);
      return v.engineMake || v.engineModel
        ? formatEngines(v.engineCount, v.engineMake, v.engineModel)
        : `${v.engineCount}× engine${v.engineCount > 1 ? "s" : ""}`;
    },
  },
  {
    label: "Total horsepower",
    get: (b) => pv(b).totalHorsepower,
    dir: "max",
    best: "most power",
    render: (b) =>
      pv(b).totalHorsepower != null ? formatHp(pv(b).totalHorsepower) : EM_DASH,
  },
  {
    label: "Cruise speed",
    get: (b) => pv(b).cruiseSpeedKts,
    dir: "max",
    best: "fastest cruise",
    render: (b, _u, mph) =>
      pv(b).cruiseSpeedKts != null
        ? formatSpeed(pv(b).cruiseSpeedKts, mph)
        : EM_DASH,
  },
  {
    label: "Top speed",
    get: (b) => pv(b).topSpeedKts,
    dir: "max",
    best: "fastest",
    render: (b, _u, mph) =>
      pv(b).topSpeedKts != null ? formatSpeed(pv(b).topSpeedKts, mph) : EM_DASH,
  },
  {
    label: "Range",
    get: (b) => pv(b).rangeNm,
    dir: "max",
    best: "longest range",
    render: (b) => (pv(b).rangeNm != null ? formatRange(pv(b).rangeNm) : EM_DASH),
  },
  {
    label: "Fuel capacity",
    get: (b) => pv(b).fuelCapacityGal,
    dir: "max",
    best: "most fuel",
    render: (b, u) =>
      pv(b).fuelCapacityGal != null
        ? formatCapacity(pv(b).fuelCapacityGal, u)
        : EM_DASH,
  },
  {
    label: "Water capacity",
    get: (b) => pv(b).waterCapacityGal,
    dir: "max",
    render: (b, u) =>
      pv(b).waterCapacityGal != null
        ? formatCapacity(pv(b).waterCapacityGal, u)
        : EM_DASH,
  },
  {
    label: "Staterooms",
    get: (b) => pv(b).staterooms,
    dir: "max",
    best: "most cabins",
    render: (b) =>
      pv(b).staterooms != null ? String(pv(b).staterooms) : EM_DASH,
  },
  {
    label: "Heads",
    get: (b) => pv(b).heads,
    dir: "max",
    render: (b) => (pv(b).heads != null ? String(pv(b).heads) : EM_DASH),
  },
  {
    label: "Hull type",
    get: () => null,
    dir: "none",
    render: (b) => <HullTypeBadge value={b.hullType} />,
  },
  {
    label: "Hull material",
    get: () => null,
    dir: "none",
    render: (b) => <HullMaterialBadge value={b.hullMaterial} />,
  },
  {
    label: "Propulsion",
    get: () => null,
    dir: "none",
    render: (b) => <PropulsionBadge value={b.propulsion} />,
  },
];

/** Index of the winning column for a row, or null when there's no clear winner. */
function winners(row: Row, boats: GlobalBoat[]): Set<number> {
  const out = new Set<number>();
  if (row.dir === "none") return out;
  const vals = boats.map((b) => row.get(b));
  const present = vals.filter((v): v is number => v != null);
  if (present.length < 2) return out;
  const target =
    row.dir === "max" ? Math.max(...present) : Math.min(...present);
  // Don't bother highlighting if every boat ties.
  if (present.every((v) => v === target)) return out;
  vals.forEach((v, i) => {
    if (v === target) out.add(i);
  });
  return out;
}

export default function CompareView({ onClose }: { onClose: () => void }) {
  const ids = useGlobalStore((s) => s.compareIds);
  const allBoats = useGlobalStore((s) => s.boats);
  const toggleCompare = useGlobalStore((s) => s.toggleCompare);
  const openBoat = useGlobalStore((s) => s.openBoat);
  const unit = useExplorerStore((s) => s.unit);
  const speedMph = useExplorerStore((s) => s.speedMph);

  const boats = ids
    .map((id) => allBoats.find((b) => b.id === id))
    .filter((b): b is GlobalBoat => Boolean(b));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Column width scales down a touch as more boats are added.
  const colW = boats.length >= 4 ? 180 : boats.length === 3 ? 210 : 240;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[2px]"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Compare boats"
          className="panel relative flex max-h-full w-full max-w-[1100px] flex-col overflow-hidden"
          variants={{
            hidden: { opacity: 0, scale: 0.97, y: 12 },
            visible: { opacity: 1, scale: 1, y: 0 },
          }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <h2 className="font-display text-base font-semibold text-ink">
                Comparing {boats.length} boat{boats.length === 1 ? "" : "s"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison"
              className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-surface-2/80 text-muted transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th
                    className="sticky left-0 top-0 z-30 border-b border-r border-line bg-surface-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted"
                    style={{ width: 150, minWidth: 150 }}
                  />
                  {boats.map((b) => (
                    <th
                      key={b.id}
                      className="sticky top-0 z-20 border-b border-line bg-surface-2 p-0 align-top"
                      style={{ width: colW, minWidth: colW }}
                    >
                      <div className="relative p-3">
                        <button
                          type="button"
                          onClick={() => toggleCompare(b.id)}
                          aria-label={`Remove ${b.name}`}
                          className="focus-ring absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-md bg-surface/80 text-muted backdrop-blur hover:text-ink"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openBoat(b.id)}
                          className="focus-ring block w-full overflow-hidden rounded-thumb border border-line"
                        >
                          <Thumbnail
                            src={b.imageUrl}
                            alt={b.name}
                            category={b.category}
                            width={colW}
                            height={Math.round(colW * 0.6)}
                            className="h-auto w-full object-cover"
                          />
                        </button>
                        <p className="mt-2 truncate text-left font-display text-[13px] font-bold text-ink">
                          {b.name}
                        </p>
                        <p className="truncate text-left text-[11px] text-muted">
                          {b.manufacturerName}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => {
                  const win = winners(row, boats);
                  return (
                    <tr key={row.label} className={ri % 2 ? "" : "bg-surface-2/30"}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-b border-r border-line bg-[inherit] px-3 py-2 text-left align-middle text-[11px] font-medium uppercase tracking-wide text-muted"
                        style={{ width: 150, minWidth: 150 }}
                      >
                        {row.label}
                      </th>
                      {boats.map((b, ci) => {
                        const isWin = win.has(ci);
                        return (
                          <td
                            key={b.id}
                            className={`num border-b border-line px-3 py-2 text-left align-middle ${
                              isWin
                                ? "bg-accent/10 font-semibold text-ink ring-1 ring-inset ring-accent/30"
                                : "text-ink"
                            }`}
                            style={{ width: colW, minWidth: colW }}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {row.render(b, unit, speedMph)}
                              {isWin && row.best && (
                                <span className="rounded-full bg-accent/20 px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-accent">
                                  {row.best}
                                </span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
