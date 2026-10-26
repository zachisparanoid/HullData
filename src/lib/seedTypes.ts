// Authoring shape for the curated seed dataset. The seeder (prisma/seed.ts)
// validates each record against a Zod schema derived from the same unions
// before insert, so any typo in a category/propulsion value fails loudly.

import type {
  BoatCategory,
  HullType,
  Propulsion,
  HullMaterial,
} from "./types";

export interface SeedVariant {
  /** Representative model year; omit/null = whole production span. */
  modelYear?: number | null;
  loaFt: number;
  beamFt: number;
  draftFt: number;
  displacementLbs?: number | null;
  engineMake?: string | null;
  engineModel?: string | null;
  engineCount: number;
  horsepowerEach?: number | null;
  totalHorsepower?: number | null;
  fuelCapacityGal?: number | null;
  waterCapacityGal?: number | null;
  cruiseSpeedKts?: number | null;
  topSpeedKts?: number | null;
  rangeNm?: number | null;
  staterooms?: number | null;
  heads?: number | null;
  notes?: string | null;
}

export interface SeedModel {
  name: string;
  category: BoatCategory;
  hullType: HullType;
  propulsion: Propulsion;
  hullMaterial: HullMaterial;
  productionStartYear: number;
  /** null/omit = still in production ("present"). */
  productionEndYear?: number | null;
  /** Optional explicit thumbnail; if omitted the seeder derives a category silhouette. */
  imageUrl?: string | null;
  blurb: string;
  /** 1-3 variants; the first is treated as the representative spec. */
  variants: SeedVariant[];
}

export interface SeedManufacturer {
  slug: string;
  name: string;
  country: string;
  foundedYear?: number | null;
  defunctYear?: number | null;
  headquarters?: string | null;
  description: string;
  logoUrl?: string | null;
  website?: string | null;
  models: SeedModel[];
}
