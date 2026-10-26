/**
 * HullData seeder — idempotent. Re-running upserts by stable keys and prunes
 * anything no longer in the seed file, so the database always exactly mirrors
 * src/lib/seedData.ts. Every record is validated against a Zod schema derived
 * from the same string-literal unions the app uses, so an invalid enum value
 * (or a sneaked-in sailboat) fails loudly before any write.
 *
 * Run: `npm run db:seed`  (or `npm run db:reset` to wipe + reseed)
 */
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { seedManufacturers } from "../src/lib/seedData";
import { categoryPlaceholder } from "../src/lib/placeholders";
import {
  BOAT_CATEGORIES,
  HULL_TYPES,
  PROPULSIONS,
  HULL_MATERIALS,
} from "../src/lib/types";

const prisma = new PrismaClient();

// --- Validation -----------------------------------------------------------

const variantSchema = z.object({
  modelYear: z.number().int().min(1950).max(2030).nullish(),
  loaFt: z.number().positive().max(400),
  beamFt: z.number().positive().max(120),
  draftFt: z.number().positive().max(40),
  displacementLbs: z.number().int().positive().nullish(),
  engineMake: z.string().min(1).nullish(),
  engineModel: z.string().min(1).nullish(),
  engineCount: z.number().int().min(1).max(8),
  horsepowerEach: z.number().int().positive().nullish(),
  totalHorsepower: z.number().int().positive().nullish(),
  fuelCapacityGal: z.number().int().nonnegative().nullish(),
  waterCapacityGal: z.number().int().nonnegative().nullish(),
  cruiseSpeedKts: z.number().nonnegative().max(120).nullish(),
  topSpeedKts: z.number().nonnegative().max(120).nullish(),
  rangeNm: z.number().int().nonnegative().nullish(),
  staterooms: z.number().int().nonnegative().max(12).nullish(),
  heads: z.number().int().nonnegative().max(12).nullish(),
  notes: z.string().nullish(),
});

const modelSchema = z
  .object({
    name: z.string().min(1),
    category: z.enum(BOAT_CATEGORIES),
    hullType: z.enum(HULL_TYPES),
    propulsion: z.enum(PROPULSIONS),
    hullMaterial: z.enum(HULL_MATERIALS),
    productionStartYear: z.number().int().min(1950).max(2030),
    productionEndYear: z.number().int().min(1950).max(2030).nullish(),
    imageUrl: z.string().nullish(),
    blurb: z.string().min(1),
    variants: z.array(variantSchema).min(1).max(3),
  })
  .refine(
    (m) =>
      m.productionEndYear == null ||
      m.productionEndYear >= m.productionStartYear,
    { message: "productionEndYear must be >= productionStartYear" },
  );

const manufacturerSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  country: z.string().min(1),
  foundedYear: z.number().int().min(1800).max(2030).nullish(),
  defunctYear: z.number().int().min(1800).max(2030).nullish(),
  headquarters: z.string().nullish(),
  description: z.string().min(1),
  logoUrl: z.string().nullish(),
  website: z.string().nullish(),
  models: z.array(modelSchema).min(1).max(20),
});

const datasetSchema = z.array(manufacturerSchema).min(1);

// --- Seed -----------------------------------------------------------------

async function main() {
  const parsed = datasetSchema.safeParse(seedManufacturers);
  if (!parsed.success) {
    console.error("❌ Seed data failed validation:\n");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }
  const data = parsed.data;

  // Guard against duplicate slugs / duplicate model names within a brand.
  const slugs = new Set<string>();
  for (const m of data) {
    if (slugs.has(m.slug)) throw new Error(`Duplicate manufacturer slug: ${m.slug}`);
    slugs.add(m.slug);
    const names = new Set<string>();
    for (const model of m.models) {
      const key = model.name.toLowerCase();
      if (names.has(key))
        throw new Error(`Duplicate model "${model.name}" in ${m.slug}`);
      names.add(key);
    }
  }

  let mfrCount = 0;
  let modelCount = 0;
  let variantCount = 0;

  for (const m of data) {
    const manufacturer = await prisma.manufacturer.upsert({
      where: { slug: m.slug },
      create: {
        slug: m.slug,
        name: m.name,
        country: m.country,
        foundedYear: m.foundedYear ?? null,
        defunctYear: m.defunctYear ?? null,
        headquarters: m.headquarters ?? null,
        description: m.description,
        logoUrl: m.logoUrl ?? null,
        website: m.website ?? null,
      },
      update: {
        name: m.name,
        country: m.country,
        foundedYear: m.foundedYear ?? null,
        defunctYear: m.defunctYear ?? null,
        headquarters: m.headquarters ?? null,
        description: m.description,
        logoUrl: m.logoUrl ?? null,
        website: m.website ?? null,
      },
    });
    mfrCount++;

    const keptModelNames: string[] = [];

    for (const model of m.models) {
      const imageUrl = model.imageUrl ?? categoryPlaceholder(model.category);
      const upserted = await prisma.boatModel.upsert({
        where: {
          manufacturerId_name: {
            manufacturerId: manufacturer.id,
            name: model.name,
          },
        },
        create: {
          manufacturerId: manufacturer.id,
          name: model.name,
          category: model.category,
          hullType: model.hullType,
          propulsion: model.propulsion,
          hullMaterial: model.hullMaterial,
          productionStartYear: model.productionStartYear,
          productionEndYear: model.productionEndYear ?? null,
          imageUrl,
          blurb: model.blurb,
        },
        update: {
          category: model.category,
          hullType: model.hullType,
          propulsion: model.propulsion,
          hullMaterial: model.hullMaterial,
          productionStartYear: model.productionStartYear,
          productionEndYear: model.productionEndYear ?? null,
          imageUrl,
          blurb: model.blurb,
        },
      });
      keptModelNames.push(model.name);
      modelCount++;

      // Variants have no natural key — replace wholesale to stay idempotent.
      await prisma.boatVariant.deleteMany({
        where: { boatModelId: upserted.id },
      });
      await prisma.boatVariant.createMany({
        data: model.variants.map((v, idx) => ({
          boatModelId: upserted.id,
          position: idx,
          modelYear: v.modelYear ?? null,
          loaFt: v.loaFt,
          beamFt: v.beamFt,
          draftFt: v.draftFt,
          displacementLbs: v.displacementLbs ?? null,
          engineMake: v.engineMake ?? null,
          engineModel: v.engineModel ?? null,
          engineCount: v.engineCount,
          horsepowerEach: v.horsepowerEach ?? null,
          totalHorsepower: v.totalHorsepower ?? null,
          fuelCapacityGal: v.fuelCapacityGal ?? null,
          waterCapacityGal: v.waterCapacityGal ?? null,
          cruiseSpeedKts: v.cruiseSpeedKts ?? null,
          topSpeedKts: v.topSpeedKts ?? null,
          rangeNm: v.rangeNm ?? null,
          staterooms: v.staterooms ?? null,
          heads: v.heads ?? null,
          notes: v.notes ?? null,
        })),
      });
      variantCount += model.variants.length;
    }

    // Prune models removed from the seed (cascades to their variants).
    await prisma.boatModel.deleteMany({
      where: {
        manufacturerId: manufacturer.id,
        name: { notIn: keptModelNames },
      },
    });
  }

  // Prune manufacturers removed from the seed (cascades down).
  await prisma.manufacturer.deleteMany({
    where: { slug: { notIn: data.map((m) => m.slug) } },
  });

  console.log(
    `✅ Seeded ${mfrCount} manufacturers, ${modelCount} models, ${variantCount} variants.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
