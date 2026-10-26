// Pure, synchronous client-side filtering. Runs over the already-fetched
// catalog so dragging a slider re-filters a few dozen objects in well under a
// millisecond — no server round-trips.

import {
  CATEGORY_LABELS,
  HULL_TYPE_LABELS,
  PROPULSION_LABELS,
  HULL_MATERIAL_LABELS,
  type BoatModelData,
  type ExplorerFilters,
  type Facets,
} from "./types";
import { primaryVariant } from "./facets";
import { effectiveEndYear } from "./format";

/** Filters that show everything — every range at its bound, every chip on. */
export function fullFilters(facets: Facets): ExplorerFilters {
  return {
    length: { ...facets.loa },
    hp: { ...facets.totalHp },
    years: { ...facets.years },
    categories: [...facets.categories],
    hullTypes: [...facets.hullTypes],
    propulsions: [...facets.propulsions],
    hullMaterials: [...facets.hullMaterials],
    search: "",
  };
}

function rangeActive(
  r: { min: number; max: number },
  fMin: number,
  fMax: number,
): boolean {
  return r.min > fMin || r.max < fMax;
}

function searchHaystack(model: BoatModelData): string {
  return [
    model.name,
    model.blurb,
    CATEGORY_LABELS[model.category],
    HULL_TYPE_LABELS[model.hullType],
    PROPULSION_LABELS[model.propulsion],
    HULL_MATERIAL_LABELS[model.hullMaterial],
    ...model.variants.flatMap((v) => [v.engineMake, v.engineModel, v.notes]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function applyFilters<T extends BoatModelData>(
  models: T[],
  filters: ExplorerFilters,
  facets: Facets,
): T[] {
  const q = filters.search.trim().toLowerCase();
  // For nullable numeric fields, a null only fails when the dimension is
  // actively narrowed (so a spec-less boat still shows at full range).
  const hpActive = rangeActive(filters.hp, facets.totalHp.min, facets.totalHp.max);

  return models.filter((model) => {
    const v = primaryVariant(model);

    // Length (always present)
    if (v.loaFt < filters.length.min || v.loaFt > filters.length.max) return false;

    // Total horsepower (nullable)
    if (v.totalHorsepower == null) {
      if (hpActive) return false;
    } else if (
      v.totalHorsepower < filters.hp.min ||
      v.totalHorsepower > filters.hp.max
    ) {
      return false;
    }

    // Model-year overlap: keep models whose production span intersects the window.
    const start = model.productionStartYear;
    const end = effectiveEndYear(model.productionEndYear);
    if (end < filters.years.min || start > filters.years.max) return false;

    // Multi-select chips are inclusion sets (reset = all selected).
    if (!filters.categories.includes(model.category)) return false;
    if (!filters.hullTypes.includes(model.hullType)) return false;
    if (!filters.propulsions.includes(model.propulsion)) return false;
    if (!filters.hullMaterials.includes(model.hullMaterial)) return false;

    // Free-text search across name / blurb / engines / notes
    if (q && !searchHaystack(model).includes(q)) return false;

    return true;
  });
}

/**
 * When a filter set yields zero results, suggest which single control is the
 * culprit by relaxing each dimension on its own and seeing which recovers the
 * most models. Returns a short, friendly hint (or null if nothing helps).
 */
export function suggestRelaxation(
  models: BoatModelData[],
  filters: ExplorerFilters,
  facets: Facets,
): string | null {
  const trials: { hint: string; relaxed: ExplorerFilters }[] = [
    {
      hint: "Try widening the length range.",
      relaxed: { ...filters, length: { ...facets.loa } },
    },
    {
      hint: "Try widening the horsepower range.",
      relaxed: { ...filters, hp: { ...facets.totalHp } },
    },
    {
      hint: "Try widening the model-year range.",
      relaxed: { ...filters, years: { ...facets.years } },
    },
    {
      hint: "Try clearing the search text.",
      relaxed: { ...filters, search: "" },
    },
    {
      hint: "Try selecting more categories.",
      relaxed: { ...filters, categories: [...facets.categories] },
    },
    {
      hint: "Try selecting more hull types.",
      relaxed: { ...filters, hullTypes: [...facets.hullTypes] },
    },
    {
      hint: "Try selecting more propulsion types.",
      relaxed: { ...filters, propulsions: [...facets.propulsions] },
    },
    {
      hint: "Try selecting more hull materials.",
      relaxed: { ...filters, hullMaterials: [...facets.hullMaterials] },
    },
  ];

  let best: { hint: string; count: number } | null = null;
  for (const t of trials) {
    const count = applyFilters(models, t.relaxed, facets).length;
    if (count > 0 && (!best || count > best.count)) {
      best = { hint: t.hint, count };
    }
  }
  return best?.hint ?? null;
}
