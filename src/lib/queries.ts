// Server-only data access. Maps Prisma rows (which store the enum columns as
// plain strings) onto the typed domain shapes the client consumes, casting the
// strings back to their unions — safe because the seeder Zod-validates every
// value before insert.

import { prisma } from "./db";
import { effectiveEndYear } from "./format";
import { brandImages, modelImages } from "./imageManifest";
import { modelKey } from "./imageKey";
import type {
  BoatCategory,
  HullType,
  Propulsion,
  HullMaterial,
  Variant,
  BoatModelData,
  ManufacturerCatalog,
  ManufacturerSummary,
  GlobalBoat,
} from "./types";

interface RawVariant {
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

function mapVariant(v: RawVariant): Variant {
  return {
    id: v.id,
    modelYear: v.modelYear,
    loaFt: v.loaFt,
    beamFt: v.beamFt,
    draftFt: v.draftFt,
    displacementLbs: v.displacementLbs,
    engineMake: v.engineMake,
    engineModel: v.engineModel,
    engineCount: v.engineCount,
    horsepowerEach: v.horsepowerEach,
    totalHorsepower: v.totalHorsepower,
    fuelCapacityGal: v.fuelCapacityGal,
    waterCapacityGal: v.waterCapacityGal,
    cruiseSpeedKts: v.cruiseSpeedKts,
    topSpeedKts: v.topSpeedKts,
    rangeNm: v.rangeNm,
    staterooms: v.staterooms,
    heads: v.heads,
    notes: v.notes,
  };
}

interface RawModel {
  id: string;
  name: string;
  category: string;
  hullType: string;
  propulsion: string;
  hullMaterial: string;
  productionStartYear: number;
  productionEndYear: number | null;
  imageUrl: string | null;
  blurb: string;
  variants: RawVariant[];
}

function mapModel(m: RawModel): BoatModelData {
  return {
    id: m.id,
    name: m.name,
    category: m.category as BoatCategory,
    hullType: m.hullType as HullType,
    propulsion: m.propulsion as Propulsion,
    hullMaterial: m.hullMaterial as HullMaterial,
    productionStartYear: m.productionStartYear,
    productionEndYear: m.productionEndYear,
    imageUrl: m.imageUrl,
    blurb: m.blurb,
    variants: m.variants.map(mapVariant),
  };
}

/** All manufacturers with derived counts/year-span, sorted by name. */
export async function getManufacturerSummaries(): Promise<
  ManufacturerSummary[]
> {
  const rows = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
    include: {
      models: {
        orderBy: [{ productionStartYear: "asc" }],
        select: {
          productionStartYear: true,
          productionEndYear: true,
          imageUrl: true,
        },
      },
    },
  });

  return rows.map((r) => {
    const starts = r.models.map((m) => m.productionStartYear);
    const ends = r.models.map((m) => effectiveEndYear(m.productionEndYear));
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      country: r.country,
      foundedYear: r.foundedYear,
      defunctYear: r.defunctYear,
      headquarters: r.headquarters,
      description: r.description,
      // Prefer a real bundled brand photo (drop-in pipeline) over the DB value.
      logoUrl: brandImages[r.slug] ?? r.logoUrl,
      website: r.website,
      modelCount: r.models.length,
      yearMin: starts.length ? Math.min(...starts) : null,
      yearMax: ends.length ? Math.max(...ends) : null,
      sampleImageUrl:
        brandImages[r.slug] ?? r.models[0]?.imageUrl ?? null,
    };
  });
}

/** Full catalog for one manufacturer, resolved by slug OR cuid. */
export async function getCatalog(
  idOrSlug: string,
): Promise<ManufacturerCatalog | null> {
  const r = await prisma.manufacturer.findFirst({
    where: { OR: [{ slug: idOrSlug }, { id: idOrSlug }] },
    include: {
      models: {
        orderBy: [
          { category: "asc" },
          { productionStartYear: "asc" },
          { name: "asc" },
        ],
        include: {
          variants: { orderBy: { position: "asc" } },
        },
      },
    },
  });
  if (!r) return null;

  // Overlay any dropped-in exact model photos (public/boats/<slug>/<key>.jpg);
  // models without one keep their category silhouette.
  const slugModels = modelImages[r.slug] ?? {};
  const models = r.models.map(mapModel);
  for (const model of models) {
    const override = slugModels[modelKey(model.name)];
    if (override) model.imageUrl = override;
  }

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    country: r.country,
    foundedYear: r.foundedYear,
    defunctYear: r.defunctYear,
    headquarters: r.headquarters,
    description: r.description,
    logoUrl: brandImages[r.slug] ?? r.logoUrl,
    website: r.website,
    models,
  };
}

/** Every model flattened with its manufacturer — for the cross-builder explorer. */
export async function getAllModels(): Promise<GlobalBoat[]> {
  const rows = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
    include: {
      models: {
        orderBy: [{ name: "asc" }],
        include: { variants: { orderBy: { position: "asc" } } },
      },
    },
  });

  const out: GlobalBoat[] = [];
  for (const r of rows) {
    const slugModels = modelImages[r.slug] ?? {};
    for (const raw of r.models) {
      const model = mapModel(raw);
      const override = slugModels[modelKey(model.name)];
      if (override) model.imageUrl = override;
      out.push({
        ...model,
        manufacturerName: r.name,
        manufacturerSlug: r.slug,
        manufacturerWebsite: r.website,
      });
    }
  }
  return out;
}
