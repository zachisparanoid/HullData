// Serialize / parse the shareable explorer view state (manufacturer + filters +
// open boat) to and from URL query params. Only non-default values are written,
// so a "show everything" view stays a clean `?m=slug`. Lengths are encoded in
// canonical feet so links are unit-independent.

import {
  type ExplorerFilters,
  type Facets,
  type BoatCategory,
  type HullType,
  type Propulsion,
  type HullMaterial,
} from "./types";
import { fullFilters } from "./filters";

const round1 = (n: number) => Math.round(n * 10) / 10;

export function buildQuery(
  slug: string,
  filters: ExplorerFilters,
  facets: Facets,
  boatId: string | null,
): string {
  const p = new URLSearchParams();
  p.set("m", slug);

  if (filters.length.min > facets.loa.min)
    p.set("lenMin", String(round1(filters.length.min)));
  if (filters.length.max < facets.loa.max)
    p.set("lenMax", String(round1(filters.length.max)));
  if (filters.hp.min > facets.totalHp.min)
    p.set("hpMin", String(Math.round(filters.hp.min)));
  if (filters.hp.max < facets.totalHp.max)
    p.set("hpMax", String(Math.round(filters.hp.max)));
  if (filters.years.min > facets.years.min)
    p.set("yrMin", String(Math.round(filters.years.min)));
  if (filters.years.max < facets.years.max)
    p.set("yrMax", String(Math.round(filters.years.max)));

  if (filters.categories.length !== facets.categories.length)
    p.set("cat", filters.categories.join(","));
  if (filters.hullTypes.length !== facets.hullTypes.length)
    p.set("hull", filters.hullTypes.join(","));
  if (filters.propulsions.length !== facets.propulsions.length)
    p.set("prop", filters.propulsions.join(","));
  if (filters.hullMaterials.length !== facets.hullMaterials.length)
    p.set("mat", filters.hullMaterials.join(","));

  if (filters.search.trim()) p.set("q", filters.search.trim());
  if (boatId) p.set("boat", boatId);

  return `?${p.toString()}`;
}

function clampNum(
  raw: string | null,
  lo: number,
  hi: number,
  fallback: number,
): number {
  if (raw == null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, lo), hi);
}

function parseList<T extends string>(
  raw: string | null,
  all: readonly T[],
): T[] {
  if (raw == null) return [...all];
  const valid = new Set<string>(all);
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => valid.has(s)) as T[];
}

export function parseFilters(
  sp: URLSearchParams,
  facets: Facets,
): ExplorerFilters {
  const base = fullFilters(facets);

  let lenMin = clampNum(sp.get("lenMin"), facets.loa.min, facets.loa.max, facets.loa.min);
  let lenMax = clampNum(sp.get("lenMax"), facets.loa.min, facets.loa.max, facets.loa.max);
  if (lenMin > lenMax) [lenMin, lenMax] = [facets.loa.min, facets.loa.max];

  let hpMin = clampNum(sp.get("hpMin"), facets.totalHp.min, facets.totalHp.max, facets.totalHp.min);
  let hpMax = clampNum(sp.get("hpMax"), facets.totalHp.min, facets.totalHp.max, facets.totalHp.max);
  if (hpMin > hpMax) [hpMin, hpMax] = [facets.totalHp.min, facets.totalHp.max];

  let yrMin = clampNum(sp.get("yrMin"), facets.years.min, facets.years.max, facets.years.min);
  let yrMax = clampNum(sp.get("yrMax"), facets.years.min, facets.years.max, facets.years.max);
  if (yrMin > yrMax) [yrMin, yrMax] = [facets.years.min, facets.years.max];

  return {
    length: { min: lenMin, max: lenMax },
    hp: { min: hpMin, max: hpMax },
    years: { min: yrMin, max: yrMax },
    categories: parseList<BoatCategory>(sp.get("cat"), facets.categories),
    hullTypes: parseList<HullType>(sp.get("hull"), facets.hullTypes),
    propulsions: parseList<Propulsion>(sp.get("prop"), facets.propulsions),
    hullMaterials: parseList<HullMaterial>(sp.get("mat"), facets.hullMaterials),
    search: sp.get("q") ?? base.search,
  };
}
