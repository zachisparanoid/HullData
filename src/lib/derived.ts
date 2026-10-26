// Pure, derived insight computed from a model's primary-variant specs — no new
// data, just arithmetic and clearly-stated heuristics. Used for the drawer's
// "at a glance" section and the cross-builder capability filters. Every flag
// carries a plain-English rule so a newcomer learns *why* it applies.

import { primaryVariant } from "./facets";
import type { BoatModelData, Variant } from "./types";

export interface DerivedMetrics {
  /** Nautical miles per gallon at cruise (range ÷ usable fuel). */
  nmpg: number | null;
  /** Estimated fuel burn at cruise, US gallons/hour (cruise ÷ nmpg). */
  gphAtCruise: number | null;
  /** Run time at cruise before the tanks are dry, hours (range ÷ cruise). */
  hoursAtCruise: number | null;
}

const finite = (v: number | null | undefined): v is number =>
  typeof v === "number" && Number.isFinite(v);

/** Round to `d` decimals. */
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

export function computeDerivedFromVariant(v: Variant): DerivedMetrics {
  const range = v.rangeNm;
  const fuel = v.fuelCapacityGal;
  const cruise = v.cruiseSpeedKts;

  const nmpg =
    finite(range) && finite(fuel) && fuel > 0 ? round(range / fuel, 2) : null;
  const gphAtCruise =
    finite(cruise) && nmpg != null && nmpg > 0 ? round(cruise / nmpg, 1) : null;
  const hoursAtCruise =
    finite(range) && finite(cruise) && cruise > 0
      ? round(range / cruise, 1)
      : null;

  return { nmpg, gphAtCruise, hoursAtCruise };
}

export function computeDerived(model: BoatModelData): DerivedMetrics {
  return computeDerivedFromVariant(primaryVariant(model));
}

export type CapabilityKey =
  | "liveaboard"
  | "shoalDraft"
  | "trailerable"
  | "longRange"
  | "fast"
  | "efficient"
  | "passagemaker";

export interface CapabilityDef {
  key: CapabilityKey;
  label: string;
  /** Plain-English rule shown as a tooltip / in the glossary. */
  why: string;
  test: (m: BoatModelData) => boolean;
}

// Thresholds operate on canonical imperial values (ft, gal, kt).
export const CAPABILITIES: CapabilityDef[] = [
  {
    key: "liveaboard",
    label: "Liveaboard",
    why: "Two or more staterooms, a head, and 35 ft or more — room to live aboard comfortably.",
    test: (m) => {
      const v = primaryVariant(m);
      return (
        (v.staterooms ?? 0) >= 2 &&
        (v.heads ?? 0) >= 1 &&
        v.loaFt >= 35
      );
    },
  },
  {
    key: "shoalDraft",
    label: "Shoal draft",
    why: "Draws 3 ft or less — can reach skinny water and shallow anchorages bigger boats can't.",
    test: (m) => primaryVariant(m).draftFt <= 3.0,
  },
  {
    key: "trailerable",
    label: "Trailerable",
    why: "8’6″ beam or narrower and 30 ft or shorter — towable behind a truck without a wide-load permit.",
    test: (m) => {
      const v = primaryVariant(m);
      return v.beamFt <= 8.5 && v.loaFt <= 30;
    },
  },
  {
    key: "longRange",
    label: "Long range",
    why: "1,000+ nautical miles between fuel stops — equipped for long passages.",
    test: (m) => (primaryVariant(m).rangeNm ?? 0) >= 1000,
  },
  {
    key: "fast",
    label: "Fast",
    why: "30+ knot top end — quick onto plane and able to cover ground or outrun weather.",
    test: (m) => (primaryVariant(m).topSpeedKts ?? 0) >= 30,
  },
  {
    key: "efficient",
    label: "Fuel-efficient",
    why: "1.5+ nautical miles per gallon at cruise — frugal for a powerboat.",
    test: (m) => {
      const d = computeDerived(m);
      return d.nmpg != null && d.nmpg >= 1.5;
    },
  },
  {
    key: "passagemaker",
    label: "Passagemaker",
    why: "Full- or semi-displacement hull on a trawler or motor yacht — built for steady, economical open-water passages.",
    test: (m) =>
      (m.hullType === "FULL_DISPLACEMENT" ||
        m.hullType === "SEMI_DISPLACEMENT") &&
      (m.category === "TRAWLER" || m.category === "MOTOR_YACHT"),
  },
];

export const CAPABILITY_BY_KEY: Record<CapabilityKey, CapabilityDef> =
  Object.fromEntries(CAPABILITIES.map((c) => [c.key, c])) as Record<
    CapabilityKey,
    CapabilityDef
  >;

/** The capability flags a given model satisfies, in canonical order. */
export function capabilitiesFor(model: BoatModelData): CapabilityDef[] {
  return CAPABILITIES.filter((c) => c.test(model));
}
