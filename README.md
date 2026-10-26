# HullData

A reference library of production powerboats — **57 builders, 458 models, 507 variants** — with
searchable specs, side-by-side comparison, and a buyer's toolkit. Built for people shopping for a
boat who are tired of manufacturer PDFs and forum hearsay.

Self-hosted Next.js 14 app (App Router) on Prisma + SQLite. No account, no server-side tracking,
and it installs as a PWA so it works on a dock with no signal.

## What it does

- **Per-builder catalogs** — every model and variant with LOA, beam, draft, displacement, fuel
  capacity, engine configuration, horsepower, and production years.
- **`/explore` — global search and compare.** One filter rail across all 57 builders (length,
  horsepower, year, category, hull type, a searchable builder multi-select, and "good for"
  capability chips). Select 2–4 boats to get a side-by-side matrix that highlights the winner in
  each row — longest, most power, shallowest draft, most fuel.
- **`/learn` — a buyer's guide.** Plain-language glossary, a how-to-read-the-spec-sheet key, and
  what to actually look for in each of the six categories.
- **Derived metrics.** Fuel burn, run time, and efficiency at cruise, computed from range/fuel/cruise
  data and labelled as estimates rather than dressed up as manufacturer figures.
- **Favorites / shortlist** persisted to `localStorage`, with a favorites-only filter for building a
  cross-builder list.
- **`/api/hullcheck`** — a catalog export endpoint that feeds
  [HullCheck](https://github.com/zachisparanoid/HullCheck), the offline marine survey app.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma 6 + SQLite · TanStack Table ·
zustand · framer-motion · zod.

## Run it

```bash
npm install
npm run setup      # prisma generate + db push + seed the catalog
npm run dev        # http://localhost:3000
```

`npm run build && npm start` for production. The build's `prebuild` step re-syncs boat imagery
(see below).

## Boat images are not in this repo

`public/boats/` and `public/brands/` are deliberately excluded — they are ~300 MB of manufacturer
press photos and are not mine to redistribute. `scripts/sync-images.mjs` re-fetches them into place
on `npm run build` or via `npm run sync:images`.

Without them the app still renders: `src/components/Thumbnail.tsx` falls back to the category SVGs
in `public/placeholders/`.

## Data

The catalog is seeded from publicly published manufacturer specifications. The numbers are
transcribed, not invented — but treat any single figure as "check the builder's own sheet before you
wire money to anyone." The seed lives in `prisma/seed.ts`; the SQLite file itself is gitignored.

`scripts/` also contains the harvesting helpers used to build the catalog
(`harvest-brands.mjs`, `harvest-models-ddg.mjs`) if you want to extend it.

## License

MIT — see [LICENSE](LICENSE).
