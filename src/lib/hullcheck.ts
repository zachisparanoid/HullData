// Generates a HullCheck-importable project file from a HullData boat. The shape
// mirrors HullCheck's `ProjectBundle` kotlinx.serialization DTOs exactly:
// envelope { format:"hullcheck-project", version:1, exportedAtEpochMilli, project }.
// HullCheck regenerates all IDs on import and ignores unknown keys, so we only
// emit required fields plus the ones worth pre-filling. The bundled standard
// survey checklist is embedded so the imported project opens ready to inspect.

import { primaryVariant } from "./facets";
import {
  CATEGORY_LABELS,
  HULL_TYPE_LABELS,
  HULL_MATERIAL_LABELS,
  PROPULSION_LABELS,
  type BoatModelData,
  type BoatCategory,
  type Propulsion,
} from "./types";
import { formatYears, stripMakePrefix, fullModelName } from "./format";
import rawChecklist from "@/data/hullcheckChecklist.json";

// HullCheck enum (serialized as the constant name).
export type HullCheckBoatType =
  | "SAIL_MONOHULL"
  | "SAIL_CATAMARAN"
  | "POWER_INBOARD"
  | "POWER_OUTBOARD"
  | "POWER_STERNDRIVE"
  | "TRAWLER"
  | "PWC"
  | "DINGHY"
  | "OTHER";

interface HcItem {
  title: string;
  guidance?: string;
  status: "PENDING";
  sortOrder: number;
  isCustom: boolean;
}
interface HcCategory {
  name: string;
  iconKey: string;
  sortOrder: number;
  isEngineRelated: boolean;
  isSkippable: boolean;
  items: HcItem[];
}
interface HcProject {
  boatName: string;
  boatType: HullCheckBoatType;
  make?: string;
  model?: string;
  yearBuilt?: number;
  lengthFeet?: number;
  surveyDateEpochDay: number;
  surveyType: "PRE_PURCHASE";
  status: "DRAFT";
  generalNotes?: string;
  createdAtEpochMilli: number;
  updatedAtEpochMilli: number;
  categories: HcCategory[];
  projectPhotos: never[];
}
export interface HullCheckBundle {
  format: "hullcheck-project";
  version: 1;
  exportedAtEpochMilli: number;
  project: HcProject;
}

interface RawCategory {
  name: string;
  iconKey: string;
  isEngineRelated: boolean;
  isSkippable: boolean;
  items: { title: string; guidance?: string }[];
}

const CHECKLIST = rawChecklist as { categories: RawCategory[] };

/** Days since 1970-01-01 for the local calendar date — matches LocalDate.ofEpochDay. */
function epochDay(d: Date): number {
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
  );
}

/** HullData category + propulsion → the closest HullCheck BoatType. */
export function mapBoatType(
  category: BoatCategory,
  propulsion: Propulsion,
): HullCheckBoatType {
  if (category === "TRAWLER") return "TRAWLER";
  switch (propulsion) {
    case "OUTBOARD":
      return "POWER_OUTBOARD";
    case "STERNDRIVE":
      return "POWER_STERNDRIVE";
    default:
      return "POWER_INBOARD";
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function seedNotes(model: BoatModelData, make: string): string {
  const v = primaryVariant(model);
  const lines: (string | null)[] = [
    "Prefilled from HullData — a powerboat reference library.",
    "",
    fullModelName(make, model.name),
    `${CATEGORY_LABELS[model.category]} · ${HULL_TYPE_LABELS[model.hullType]} · ${HULL_MATERIAL_LABELS[model.hullMaterial]} · ${PROPULSION_LABELS[model.propulsion]}`,
    `Production: ${formatYears(model.productionStartYear, model.productionEndYear)}`,
    "",
    "Reference specs (primary configuration):",
    `• LOA ${round1(v.loaFt)} ft · beam ${round1(v.beamFt)} ft · draft ${round1(v.draftFt)} ft`,
    v.engineMake || v.engineModel
      ? `• ${v.engineCount}× ${[v.engineMake, v.engineModel].filter(Boolean).join(" ")}${v.totalHorsepower ? ` (${v.totalHorsepower} hp total)` : ""}`
      : null,
    v.cruiseSpeedKts != null || v.topSpeedKts != null
      ? `• Cruise ${v.cruiseSpeedKts ?? "—"} kt · top ${v.topSpeedKts ?? "—"} kt`
      : null,
    v.rangeNm != null || v.fuelCapacityGal != null
      ? `• Range ${v.rangeNm ?? "—"} nm · fuel ${v.fuelCapacityGal ?? "—"} gal`
      : null,
    v.staterooms != null || v.heads != null
      ? `• ${v.staterooms ?? "—"} stateroom(s) · ${v.heads ?? "—"} head(s)`
      : null,
    "",
    model.blurb,
    "",
    "Note: reference figures only — verify every measurement against the actual vessel during survey.",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

function checklistCategories(): HcCategory[] {
  return CHECKLIST.categories.map((c, ci) => ({
    name: c.name,
    iconKey: c.iconKey,
    sortOrder: ci,
    isEngineRelated: c.isEngineRelated,
    isSkippable: c.isSkippable,
    items: c.items.map((it, ii) => ({
      title: it.title,
      guidance: it.guidance,
      status: "PENDING" as const,
      sortOrder: ii,
      isCustom: false,
    })),
  }));
}

/**
 * Build a HullCheck-importable bundle for a boat. `now` is passed in so the
 * function stays pure/testable; the caller supplies `new Date()`.
 */
export function buildSurveyBundle(
  model: BoatModelData,
  make: string,
  now: Date,
): HullCheckBundle {
  const v = primaryVariant(model);
  const ms = now.getTime();
  return {
    format: "hullcheck-project",
    version: 1,
    exportedAtEpochMilli: ms,
    project: {
      boatName: fullModelName(make, model.name),
      boatType: mapBoatType(model.category, model.propulsion),
      make,
      model: stripMakePrefix(make, model.name),
      yearBuilt: model.productionStartYear,
      lengthFeet: round1(v.loaFt),
      surveyDateEpochDay: epochDay(now),
      surveyType: "PRE_PURCHASE",
      status: "DRAFT",
      generalNotes: seedNotes(model, make),
      createdAtEpochMilli: ms,
      updatedAtEpochMilli: ms,
      categories: checklistCategories(),
      projectPhotos: [],
    },
  };
}
