"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { COLUMN_META } from "@/lib/columns";
import { specColumns } from "@/lib/boatColumns";
import { CategoryBadge } from "@/components/SpecBadge";
import Thumbnail from "@/components/Thumbnail";
import VariantSubTable from "@/components/VariantSubTable";
import ScrollShadow from "@/components/ScrollShadow";
import type { BoatModelData, UnitSystem } from "@/lib/types";

const NAME_W = 212;
const THUMB_W = 120;

const NUMERIC_IDS = new Set(
  COLUMN_META.filter((c) => c.numeric).map((c) => c.id),
);
const MIN_W: Record<string, number> = {
  years: 116,
  loa: 92,
  beam: 88,
  draft: 88,
  engines: 168,
  totalHp: 96,
  speed: 120,
  range: 100,
  fuel: 104,
  displacement: 110,
  hull: 180,
  berths: 120,
};

const col = createColumnHelper<BoatModelData>();

function buildColumns(
  unit: UnitSystem,
  speedMph: boolean,
): ColumnDef<BoatModelData, unknown>[] {
  return [
    col.accessor((m) => m.name, {
      id: "name",
      header: "Boat",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const m = row.original;
        const canExpand = m.variants.length > 1;
        return (
          <div className="flex items-center gap-1.5">
            {canExpand ? (
              <button
                type="button"
                aria-label={
                  row.getIsExpanded() ? "Collapse variants" : "Show variants"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  row.toggleExpanded();
                }}
                className="focus-ring -ml-1 grid h-5 w-5 shrink-0 place-items-center rounded text-muted hover:text-ink"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    row.getIsExpanded() ? "rotate-90" : ""
                  }`}
                />
              </button>
            ) : (
              <span className="w-4 shrink-0" aria-hidden="true" />
            )}
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-display text-[13px] font-semibold text-ink">
                {m.name}
              </span>
              <span className="mt-1 flex">
                <CategoryBadge value={m.category} />
              </span>
            </span>
          </div>
        );
      },
    }),
    col.display({
      id: "thumbnail",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const m = row.original;
        return (
          <button
            type="button"
            aria-label={`View ${m.name} details`}
            onClick={(e) => {
              e.stopPropagation();
              useExplorerStore.getState().openBoat(m.id);
            }}
            className="focus-ring block overflow-hidden rounded-thumb border border-line transition-transform hover:scale-[1.03]"
          >
            <Thumbnail
              src={m.imageUrl}
              alt={m.name}
              category={m.category}
              width={THUMB_W - 12}
              height={64}
              className="h-16 w-[108px] object-cover"
            />
          </button>
        );
      },
    }),
    ...specColumns<BoatModelData>(unit, speedMph),
  ] as ColumnDef<BoatModelData, unknown>[];
}

function stickyProps(id: string, isHeader: boolean) {
  if (id === "name") {
    return {
      className: `sticky left-0 ${isHeader ? "z-30" : "z-10"}`,
      style: { width: NAME_W, minWidth: NAME_W, maxWidth: NAME_W, left: 0 },
    };
  }
  if (id === "thumbnail") {
    return {
      className: `sticky pin-shadow ${isHeader ? "z-30" : "z-10"}`,
      style: {
        width: THUMB_W,
        minWidth: THUMB_W,
        maxWidth: THUMB_W,
        left: NAME_W,
      },
    };
  }
  return {
    className: "",
    style: { minWidth: MIN_W[id] ?? 96 } as React.CSSProperties,
  };
}

export default function BoatTable({ models }: { models: BoatModelData[] }) {
  const unit = useExplorerStore((s) => s.unit);
  const speedMph = useExplorerStore((s) => s.speedMph);
  const sorting = useExplorerStore((s) => s.sorting);
  const setSorting = useExplorerStore((s) => s.setSorting);
  const columnVisibility = useExplorerStore((s) => s.columnVisibility);
  const setColumnVisibility = useExplorerStore((s) => s.setColumnVisibility);
  const openBoat = useExplorerStore((s) => s.openBoat);

  const columns = useMemo(
    () => buildColumns(unit, speedMph),
    [unit, speedMph],
  );

  const table = useReactTable({
    data: models,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility(
        typeof updater === "function" ? updater(columnVisibility) : updater,
      ),
    getRowId: (m) => m.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.variants.length > 1,
    enableSortingRemoval: true,
  });

  const colSpan = table.getVisibleLeafColumns().length;

  return (
    <ScrollShadow>
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {table.getFlatHeaders().map((header) => {
              const id = header.column.id;
              const numeric = NUMERIC_IDS.has(id);
              const sticky = stickyProps(id, true);
              const sorted = header.column.getIsSorted();
              const canSort = header.column.getCanSort();
              return (
                <th
                  key={header.id}
                  className={`border-b border-line bg-surface-2 px-3.5 py-2.5 text-table-head font-semibold uppercase tracking-wider text-muted ${sticky.className}`}
                  style={{ ...sticky.style, position: "sticky", top: 0 }}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={`focus-ring flex w-full items-center gap-1 ${
                        numeric ? "justify-end" : "justify-start"
                      } text-muted transition-colors hover:text-ink`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sorted === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-accent" />
                      ) : sorted === "desc" ? (
                        <ArrowDown className="h-3 w-3 text-accent" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </button>
                  ) : (
                    <span className={numeric ? "block text-right" : ""}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, idx) => (
            <FragmentRow
              key={row.id}
              idx={idx}
              colSpan={colSpan}
              unit={unit}
              speedMph={speedMph}
              row={row}
              onOpen={() => openBoat(row.original.id)}
            />
          ))}
        </tbody>
      </table>
    </ScrollShadow>
  );
}

// Extracted so each model + its (optional) expanded variant block stays together.
function FragmentRow({
  row,
  idx,
  colSpan,
  unit,
  speedMph,
  onOpen,
}: {
  row: import("@tanstack/react-table").Row<BoatModelData>;
  idx: number;
  colSpan: number;
  unit: UnitSystem;
  speedMph: boolean;
  onOpen: () => void;
}) {
  const rowStyle = {
    "--row-bg": idx % 2 ? "var(--row-b)" : "var(--row-a)",
    animation: idx < 24 ? "hd-row-in 0.4s ease-out both" : undefined,
    animationDelay: idx < 24 ? `${idx * 14}ms` : undefined,
  } as React.CSSProperties;

  return (
    <>
      <tr
        className="group cursor-pointer"
        style={rowStyle}
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen();
        }}
      >
        {row.getVisibleCells().map((cell) => {
          const id = cell.column.id;
          const numeric = NUMERIC_IDS.has(id);
          const sticky = stickyProps(id, false);
          return (
            <td
              key={cell.id}
              className={`border-b border-line px-3.5 py-2.5 align-middle bg-[var(--row-bg)] transition-colors group-hover:bg-[var(--row-hover)] ${
                numeric ? "num text-right text-[13px] text-ink" : ""
              } ${sticky.className}`}
              style={sticky.style}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
      {row.getIsExpanded() && (
        <tr style={rowStyle}>
          <td
            colSpan={colSpan}
            className="border-b border-line bg-surface-2/40 p-0"
          >
            <VariantSubTable
              variants={row.original.variants}
              unit={unit}
              speedMph={speedMph}
            />
          </td>
        </tr>
      )}
    </>
  );
}

