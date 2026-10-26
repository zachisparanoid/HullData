// Compute filter bounds + available options from a manufacturer's catalog.
// Used both server-side (the /api/facets route) and client-side. Filtering and
// facets both operate on each model's PRIMARY (representative) variant, so the
// slider bounds always match exactly what the table row displays and filters.

import {
  BOAT_CATEGORIES,
  HULL_TYPES,
  PROPULSIONS,
  HULL_MATERIALS,
  type BoatModelData,
  type Facets,
  type Variant,
} from "./types";
import { effectiveEndYear } from "./format";

export function primaryVariant(model: BoatModelData): Variant {
  return model.variants[0];
}

function present<T extends string>(order: readonly T[], values: T[]): T[] {
  const seen = new Set(values);
  return order.filter((o) => seen.has(o));
}

export function computeFacets(models: BoatModelData[]): Facets {
  if (models.length === 0) {
    return {
      loa: { min: 0, max: 0 },
      totalHp: { min: 0, max: 0 },
      years: { min: 0, max: 0 },
      categories: [],
      hullTypes: [],
      propulsions: [],
      hullMaterials: [],
    };
  }

  const loas = models.map((m) => primaryVariant(m).loaFt);
  const hps = models
    .map((m) => primaryVariant(m).totalHorsepower)
    .filter((v): v is number => v != null);
  const startYears = models.map((m) => m.productionStartYear);
  const endYears = models.map((m) => effectiveEndYear(m.productionEndYear));

  return {
    loa: {
      min: Math.floor(Math.min(...loas)),
      max: Math.ceil(Math.max(...loas)),
    },
    totalHp: hps.length
      ? { min: Math.min(...hps), max: Math.max(...hps) }
      : { min: 0, max: 0 },
    years: { min: Math.min(...startYears), max: Math.max(...endYears) },
    categories: present(
      BOAT_CATEGORIES,
      models.map((m) => m.category),
    ),
    hullTypes: present(
      HULL_TYPES,
      models.map((m) => m.hullType),
    ),
    propulsions: present(
      PROPULSIONS,
      models.map((m) => m.propulsion),
    ),
    hullMaterials: present(
      HULL_MATERIALS,
      models.map((m) => m.hullMaterial),
    ),
  };
}
