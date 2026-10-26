// Display formatting. Every formatter accepts nullable inputs and renders an
// em dash ("—") rather than "null"/"undefined"/"NaN". Rounding follows the
// spec: whole feet (trailing .0 trimmed), 1-decimal meters, 1-decimal speed,
// whole-number capacities/weights.

import {
  feetToMeters,
  gallonsToLiters,
  poundsToKilograms,
  knotsToMph,
} from "./units";
import { CURRENT_YEAR, type UnitSystem } from "./types";

export const EM_DASH = "—";

const intFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Round to `d` decimals and drop trailing zeros: 54.0 -> "54", 38.50 -> "38.5". */
function trim(n: number, d = 1): string {
  const r = Number(n.toFixed(d));
  return String(r);
}

function isNum(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function formatNumber(v: number | null | undefined): string {
  return isNum(v) ? intFmt.format(v) : EM_DASH;
}

/** Length (LOA / beam / draft), canonical feet -> active unit. */
export function formatLength(
  ft: number | null | undefined,
  system: UnitSystem,
): string {
  if (!isNum(ft)) return EM_DASH;
  return system === "metric"
    ? `${feetToMeters(ft).toFixed(1)} m`
    : `${trim(ft, 1)} ft`;
}

/** Bare length number (no unit suffix) for compact contexts. */
export function lengthValue(
  ft: number | null | undefined,
  system: UnitSystem,
): string {
  if (!isNum(ft)) return EM_DASH;
  return system === "metric" ? feetToMeters(ft).toFixed(1) : trim(ft, 1);
}

export function lengthUnit(system: UnitSystem): string {
  return system === "metric" ? "m" : "ft";
}

/** Speed. Knots by default; optionally mph. */
export function formatSpeed(
  kts: number | null | undefined,
  asMph = false,
): string {
  if (!isNum(kts)) return EM_DASH;
  return asMph ? `${trim(knotsToMph(kts), 1)} mph` : `${trim(kts, 1)} kts`;
}

/** "26 / 34 kts" — cruise / top. Renders an em dash for any missing half. */
export function formatCruiseTop(
  cruise: number | null | undefined,
  top: number | null | undefined,
  asMph = false,
): string {
  if (!isNum(cruise) && !isNum(top)) return EM_DASH;
  const unit = asMph ? "mph" : "kts";
  const conv = (v: number) => (asMph ? trim(knotsToMph(v), 1) : trim(v, 1));
  const c = isNum(cruise) ? conv(cruise) : EM_DASH;
  const t = isNum(top) ? conv(top) : EM_DASH;
  return `${c} / ${t} ${unit}`;
}

/** Liquid capacity (fuel / water), canonical gallons -> active unit. */
export function formatCapacity(
  gal: number | null | undefined,
  system: UnitSystem,
): string {
  if (!isNum(gal)) return EM_DASH;
  return system === "metric"
    ? `${intFmt.format(Math.round(gallonsToLiters(gal)))} L`
    : `${intFmt.format(Math.round(gal))} gal`;
}

/** Displacement, canonical pounds -> active unit. */
export function formatWeight(
  lbs: number | null | undefined,
  system: UnitSystem,
): string {
  if (!isNum(lbs)) return EM_DASH;
  return system === "metric"
    ? `${intFmt.format(Math.round(poundsToKilograms(lbs)))} kg`
    : `${intFmt.format(Math.round(lbs))} lbs`;
}

export function formatHp(hp: number | null | undefined): string {
  return isNum(hp) ? `${intFmt.format(hp)} hp` : EM_DASH;
}

export function formatRange(nm: number | null | undefined): string {
  return isNum(nm) ? `${intFmt.format(nm)} nm` : EM_DASH;
}

/** Production span: "2018–present" or "2004–2011". */
export function formatYears(
  start: number,
  end: number | null | undefined,
): string {
  return `${start}–${isNum(end) ? end : "present"}`;
}

/** Numeric end of production used for sorting / range math (present -> 2026). */
export function effectiveEndYear(end: number | null | undefined): number {
  return isNum(end) ? end : CURRENT_YEAR;
}

/**
 * Engine summary, correct for single-screw and multi-outboard rigs:
 * "2× Caterpillar C18", "1× Cummins QSB6.7", "4× Mercury 600".
 */
export function formatEngines(
  count: number | null | undefined,
  make: string | null | undefined,
  model: string | null | undefined,
): string {
  const parts = [make, model].filter(Boolean).join(" ").trim();
  if (!parts) return EM_DASH;
  const n = isNum(count) && count > 0 ? count : 1;
  return `${n}× ${parts}`;
}

/** "3 / 2" staterooms / heads; em dash if both missing. */
export function formatBerths(
  staterooms: number | null | undefined,
  heads: number | null | undefined,
): string {
  if (!isNum(staterooms) && !isNum(heads)) return EM_DASH;
  const s = isNum(staterooms) ? String(staterooms) : EM_DASH;
  const h = isNum(heads) ? String(heads) : EM_DASH;
  return `${s} / ${h}`;
}

export function formatCountry(country: string): string {
  return country;
}

/**
 * Strip a leading manufacturer name from a model name. Many catalog model names
 * already embed the brand ("Marine Trader 40 Double Cabin"), so combining them
 * with the make would otherwise repeat it.
 */
export function stripMakePrefix(make: string, model: string): string {
  const m = make.trim();
  const mod = model.trim();
  if (m && mod.toLowerCase().startsWith(m.toLowerCase() + " ")) {
    return mod.slice(m.length).trim();
  }
  return mod;
}

/** "<make> <model>" with the make never repeated. */
export function fullModelName(make: string, model: string): string {
  return `${make.trim()} ${stripMakePrefix(make, model)}`.trim();
}
