// HullData — shared domain types.
//
// These string-literal unions are the single source of truth for the
// "enum" columns the DB stores as plain strings. Only powered categories
// and propulsion types exist here — there is intentionally NO sail value,
// which makes sailboats structurally unrepresentable.

/** "Present"/active production is treated as this year for slider math. */
export const CURRENT_YEAR = 2026;

// ---------------------------------------------------------------------------
// Enum-like unions
// ---------------------------------------------------------------------------

export const BOAT_CATEGORIES = [
  "MOTOR_YACHT",
  "TRAWLER",
  "SPORTFISH",
  "EXPRESS_CRUISER",
  "CENTER_CONSOLE",
  "FLYBRIDGE",
] as const;
export type BoatCategory = (typeof BOAT_CATEGORIES)[number];
// Guard: `MOTORSAILER_EXCLUDED_DO_NOT_USE` from the spec is deliberately
// absent. Never add a sail-powered category to this union.

export const HULL_TYPES = [
  "PLANING",
  "SEMI_DISPLACEMENT",
  "FULL_DISPLACEMENT",
  "MODIFIED_V",
  "DEEP_V",
  "CATAMARAN_POWER",
] as const;
export type HullType = (typeof HULL_TYPES)[number];

export const PROPULSIONS = [
  "INBOARD",
  "OUTBOARD",
  "STERNDRIVE",
  "POD_DRIVE",
  "JET",
  "INBOARD_TWIN",
] as const;
export type Propulsion = (typeof PROPULSIONS)[number];
// Power only — no sails, ever.

export const HULL_MATERIALS = [
  "FIBERGLASS",
  "GRP_COMPOSITE",
  "ALUMINUM",
  "STEEL",
  "WOOD",
  "CARBON",
] as const;
export type HullMaterial = (typeof HULL_MATERIALS)[number];

// ---------------------------------------------------------------------------
// Human-readable labels
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<BoatCategory, string> = {
  MOTOR_YACHT: "Motor Yacht",
  TRAWLER: "Trawler",
  SPORTFISH: "Sportfish",
  EXPRESS_CRUISER: "Express Cruiser",
  CENTER_CONSOLE: "Center Console",
  FLYBRIDGE: "Flybridge",
};

export const HULL_TYPE_LABELS: Record<HullType, string> = {
  PLANING: "Planing",
  SEMI_DISPLACEMENT: "Semi-Displacement",
  FULL_DISPLACEMENT: "Full Displacement",
  MODIFIED_V: "Modified-V",
  DEEP_V: "Deep-V",
  CATAMARAN_POWER: "Power Catamaran",
};

export const PROPULSION_LABELS: Record<Propulsion, string> = {
  INBOARD: "Inboard",
  OUTBOARD: "Outboard",
  STERNDRIVE: "Sterndrive",
  POD_DRIVE: "Pod Drive",
  JET: "Jet",
  INBOARD_TWIN: "Inboard (Twin)",
};

export const HULL_MATERIAL_LABELS: Record<HullMaterial, string> = {
  FIBERGLASS: "Fiberglass",
  GRP_COMPOSITE: "GRP Composite",
  ALUMINUM: "Aluminum",
  STEEL: "Steel",
  WOOD: "Wood",
  CARBON: "Carbon",
};

/** Visual tone used by SpecBadge to color-code enum pills (low saturation). */
export type BadgeTone =
  | "teal"
  | "amber"
  | "slate"
  | "blue"
  | "violet"
  | "green";

export const CATEGORY_TONE: Record<BoatCategory, BadgeTone> = {
  MOTOR_YACHT: "violet",
  TRAWLER: "teal",
  SPORTFISH: "amber",
  EXPRESS_CRUISER: "blue",
  CENTER_CONSOLE: "slate",
  FLYBRIDGE: "green",
};

// ---------------------------------------------------------------------------
// API / client data shapes
// ---------------------------------------------------------------------------

export interface Variant {
  id: string;
  modelYear: number | null;
  loaFt: number;
  beamFt: number;
  draftFt: number;
  displacementLbs: number | null;
  engineMake: string | null;
  engineModel: string | null;
  engineCount: number;
  horsepowerEach: number | null;
  totalHorsepower: number | null;
  fuelCapacityGal: number | null;
  waterCapacityGal: number | null;
  cruiseSpeedKts: number | null;
  topSpeedKts: number | null;
  rangeNm: number | null;
  staterooms: number | null;
  heads: number | null;
  notes: string | null;
}

export interface BoatModelData {
  id: string;
  name: string;
  category: BoatCategory;
  hullType: HullType;
  propulsion: Propulsion;
  hullMaterial: HullMaterial;
  productionStartYear: number;
  productionEndYear: number | null;
  imageUrl: string | null;
  blurb: string;
  variants: Variant[];
}

export interface ManufacturerBase {
  id: string;
  slug: string;
  name: string;
  country: string;
  foundedYear: number | null;
  defunctYear: number | null;
  headquarters: string | null;
  description: string;
  logoUrl: string | null;
  website: string | null;
}

/** Lightweight row used by the picker + welcome card grid. */
export interface ManufacturerSummary extends ManufacturerBase {
  modelCount: number;
  yearMin: number | null;
  yearMax: number | null;
  /** A representative thumbnail (first model's image) for the welcome cards. */
  sampleImageUrl: string | null;
}

/** Full catalog fetched once when a manufacturer is selected. */
export interface ManufacturerCatalog extends ManufacturerBase {
  models: BoatModelData[];
}

/** A boat model flattened with its manufacturer — for the cross-builder view. */
export interface GlobalBoat extends BoatModelData {
  manufacturerName: string;
  manufacturerSlug: string;
  manufacturerWebsite: string | null;
}

export interface RangeFacet {
  min: number;
  max: number;
}

export interface Facets {
  loa: RangeFacet;
  totalHp: RangeFacet;
  years: RangeFacet;
  categories: BoatCategory[];
  hullTypes: HullType[];
  propulsions: Propulsion[];
  hullMaterials: HullMaterial[];
}

// ---------------------------------------------------------------------------
// UI state types
// ---------------------------------------------------------------------------

export type UnitSystem = "imperial" | "metric";
export type Theme = "dark" | "light";

export interface RangeValue {
  min: number;
  max: number;
}

export interface ExplorerFilters {
  length: RangeValue;
  hp: RangeValue;
  years: RangeValue;
  categories: BoatCategory[];
  hullTypes: HullType[];
  propulsions: Propulsion[];
  hullMaterials: HullMaterial[];
  search: string;
}

/** Typed error envelope returned by every API route on failure. */
export interface ApiError {
  error: { code: string; message: string };
}
