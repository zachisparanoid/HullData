// The 12 spec columns (years → cabins/heads) shared by the per-builder table
// (BoatTable) and the cross-builder table (GlobalBoatTable). Generic over the
// row type so each table can use its own — GlobalBoat extends BoatModelData,
// and TanStack column defs are invariant in the row type, so a plain
// ColumnDef<BoatModelData> wouldn't be assignable to ColumnDef<GlobalBoat>.

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { primaryVariant } from "@/lib/facets";
import {
  formatLength,
  formatHp,
  formatCruiseTop,
  formatCapacity,
  formatWeight,
  formatRange,
  formatYears,
  formatEngines,
  formatBerths,
} from "@/lib/format";
import { HullTypeBadge, HullMaterialBadge } from "@/components/SpecBadge";
import type { BoatModelData, UnitSystem } from "@/lib/types";

export function specColumns<T extends BoatModelData>(
  unit: UnitSystem,
  speedMph: boolean,
): ColumnDef<T, unknown>[] {
  const col = createColumnHelper<T>();
  return [
    col.accessor((m) => m.productionStartYear, {
      id: "years",
      header: "Years",
      sortingFn: "basic",
      cell: ({ row }) =>
        formatYears(
          row.original.productionStartYear,
          row.original.productionEndYear,
        ),
    }),
    col.accessor((m) => primaryVariant(m).loaFt, {
      id: "loa",
      header: "LOA",
      sortingFn: "basic",
      cell: ({ getValue }) => formatLength(getValue() as number, unit),
    }),
    col.accessor((m) => primaryVariant(m).beamFt, {
      id: "beam",
      header: "Beam",
      sortingFn: "basic",
      cell: ({ getValue }) => formatLength(getValue() as number, unit),
    }),
    col.accessor((m) => primaryVariant(m).draftFt, {
      id: "draft",
      header: "Draft",
      sortingFn: "basic",
      cell: ({ getValue }) => formatLength(getValue() as number, unit),
    }),
    col.display({
      id: "engines",
      header: "Engines",
      enableSorting: false,
      cell: ({ row }) => {
        const v = primaryVariant(row.original);
        return (
          <span className="font-sans text-[13px] text-ink">
            {formatEngines(v.engineCount, v.engineMake, v.engineModel)}
          </span>
        );
      },
    }),
    col.accessor((m) => primaryVariant(m).totalHorsepower ?? undefined, {
      id: "totalHp",
      header: "Total HP",
      sortUndefined: "last",
      sortingFn: "basic",
      cell: ({ getValue }) =>
        formatHp((getValue() as number | undefined) ?? null),
    }),
    col.accessor((m) => primaryVariant(m).cruiseSpeedKts ?? undefined, {
      id: "speed",
      header: "Cruise / Top",
      sortUndefined: "last",
      sortingFn: "basic",
      cell: ({ row }) => {
        const v = primaryVariant(row.original);
        return formatCruiseTop(v.cruiseSpeedKts, v.topSpeedKts, speedMph);
      },
    }),
    col.accessor((m) => primaryVariant(m).rangeNm ?? undefined, {
      id: "range",
      header: "Range",
      sortUndefined: "last",
      sortingFn: "basic",
      cell: ({ getValue }) =>
        formatRange((getValue() as number | undefined) ?? null),
    }),
    col.accessor((m) => primaryVariant(m).fuelCapacityGal ?? undefined, {
      id: "fuel",
      header: "Fuel",
      sortUndefined: "last",
      sortingFn: "basic",
      cell: ({ getValue }) =>
        formatCapacity((getValue() as number | undefined) ?? null, unit),
    }),
    col.accessor((m) => primaryVariant(m).displacementLbs ?? undefined, {
      id: "displacement",
      header: "Displ.",
      sortUndefined: "last",
      sortingFn: "basic",
      cell: ({ getValue }) =>
        formatWeight((getValue() as number | undefined) ?? null, unit),
    }),
    col.display({
      id: "hull",
      header: "Hull",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <HullMaterialBadge value={row.original.hullMaterial} />
          <HullTypeBadge value={row.original.hullType} />
        </div>
      ),
    }),
    col.accessor((m) => primaryVariant(m).staterooms ?? undefined, {
      id: "berths",
      header: "Cabins / Heads",
      sortUndefined: "last",
      sortingFn: "basic",
      cell: ({ row }) => {
        const v = primaryVariant(row.original);
        return formatBerths(v.staterooms, v.heads);
      },
    }),
  ] as ColumnDef<T, unknown>[];
}
