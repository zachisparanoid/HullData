"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Search, X, Check, ChevronDown } from "lucide-react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useExplorerStore } from "@/store/useExplorerStore";
import RangeSlider from "@/components/RangeSlider";
import { feetToMeters, metersToFeet } from "@/lib/units";
import { lengthUnit } from "@/lib/format";
import { CAPABILITIES } from "@/lib/derived";
import {
  CATEGORY_LABELS,
  HULL_TYPE_LABELS,
  PROPULSION_LABELS,
  HULL_MATERIAL_LABELS,
} from "@/lib/types";

const r1 = (n: number) => Math.round(n * 10) / 10;

function ChipGroup<T extends string>({
  title,
  options,
  selected,
  labels,
  onToggle,
}: {
  title: string;
  options: T[];
  selected: T[];
  labels: Record<T, string>;
  onToggle: (v: T) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <motion.button
              key={o}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onToggle(o)}
              aria-pressed={on}
              className={`focus-ring rounded-chip border px-2.5 py-1 text-xs transition-colors ${
                on
                  ? "border-accent/50 bg-accent/15 text-ink"
                  : "border-line bg-surface-2/40 text-muted hover:text-ink"
              }`}
            >
              {labels[o]}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function GlobalFilterPanel({
  shown,
  total,
  onClose,
}: {
  shown: number;
  total: number;
  onClose?: () => void;
}) {
  const facets = useGlobalStore((s) => s.facets);
  const filters = useGlobalStore((s) => s.filters);
  const manufacturers = useGlobalStore((s) => s.manufacturers);
  const selectedManu = useGlobalStore((s) => s.selectedManufacturers);
  const patch = useGlobalStore((s) => s.patchFilters);
  const setSearch = useGlobalStore((s) => s.setSearch);
  const resetFilters = useGlobalStore((s) => s.resetFilters);
  const toggleCategory = useGlobalStore((s) => s.toggleCategory);
  const toggleHullType = useGlobalStore((s) => s.toggleHullType);
  const togglePropulsion = useGlobalStore((s) => s.togglePropulsion);
  const toggleHullMaterial = useGlobalStore((s) => s.toggleHullMaterial);
  const toggleManufacturer = useGlobalStore((s) => s.toggleManufacturer);
  const setManufacturers = useGlobalStore((s) => s.setManufacturers);
  const selectedCaps = useGlobalStore((s) => s.selectedCapabilities);
  const toggleCapability = useGlobalStore((s) => s.toggleCapability);
  const unit = useExplorerStore((s) => s.unit);

  const [manuOpen, setManuOpen] = useState(false);
  const [manuQuery, setManuQuery] = useState("");

  const filteredManu = useMemo(() => {
    const q = manuQuery.trim().toLowerCase();
    return q
      ? manufacturers.filter((m) => m.name.toLowerCase().includes(q))
      : manufacturers;
  }, [manufacturers, manuQuery]);

  if (!facets) return null;

  const metric = unit === "metric";
  const loaBounds = metric
    ? {
        min: Math.floor(feetToMeters(facets.loa.min)),
        max: Math.ceil(feetToMeters(facets.loa.max)),
      }
    : facets.loa;
  const loaValue = metric
    ? {
        min: r1(feetToMeters(filters.length.min)),
        max: r1(feetToMeters(filters.length.max)),
      }
    : filters.length;
  const handleLength = (v: { min: number; max: number }) => {
    if (metric) {
      patch({
        length: {
          min: v.min <= loaBounds.min ? facets.loa.min : metersToFeet(v.min),
          max: v.max >= loaBounds.max ? facets.loa.max : metersToFeet(v.max),
        },
      });
    } else patch({ length: v });
  };

  const dirty =
    filters.search.trim() !== "" ||
    selectedManu.length > 0 ||
    selectedCaps.length > 0 ||
    filters.length.min > facets.loa.min ||
    filters.length.max < facets.loa.max ||
    filters.hp.min > facets.totalHp.min ||
    filters.hp.max < facets.totalHp.max ||
    filters.years.min > facets.years.min ||
    filters.years.max < facets.years.max ||
    filters.categories.length !== facets.categories.length ||
    filters.hullTypes.length !== facets.hullTypes.length ||
    filters.propulsions.length !== facets.propulsions.length ||
    filters.hullMaterials.length !== facets.hullMaterials.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Filters
          </span>
          <span className="num text-sm text-ink">
            Showing <span className="font-semibold text-accent">{shown}</span> of{" "}
            {total} boats
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={resetFilters}
            disabled={!dirty}
            className="focus-ring flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-muted transition-colors enabled:hover:text-ink disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="focus-ring rounded-md p-1.5 text-muted hover:text-ink lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all builders…"
            aria-label="Search all boats"
            className="focus-ring w-full rounded-lg border border-line bg-surface-2/50 py-2 pl-8 pr-3 text-sm text-ink placeholder:text-muted"
          />
        </div>

        {/* Manufacturer multi-select */}
        <div>
          <button
            type="button"
            onClick={() => setManuOpen((o) => !o)}
            className="focus-ring flex w-full items-center justify-between"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Builder
              {selectedManu.length > 0 && (
                <span className="ml-1.5 rounded-full bg-accent/20 px-1.5 text-[10px] text-accent">
                  {selectedManu.length}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted transition-transform ${manuOpen ? "rotate-180" : ""}`}
            />
          </button>
          {manuOpen && (
            <div className="mt-2 rounded-lg border border-line bg-surface-2/30 p-2">
              <input
                value={manuQuery}
                onChange={(e) => setManuQuery(e.target.value)}
                placeholder="Filter builders…"
                className="focus-ring mb-2 w-full rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink placeholder:text-muted"
              />
              {selectedManu.length > 0 && (
                <button
                  type="button"
                  onClick={() => setManufacturers([])}
                  className="mb-1 text-[11px] text-accent hover:underline"
                >
                  Clear ({selectedManu.length})
                </button>
              )}
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {filteredManu.map((m) => {
                  const on = selectedManu.includes(m.slug);
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => toggleManufacturer(m.slug)}
                      className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs text-ink hover:bg-surface-2"
                    >
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${on ? "border-accent bg-accent/20 text-accent" : "border-line text-transparent"}`}
                      >
                        {on && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="truncate">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Capability / use-case chips */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
            Good for
            {selectedCaps.length > 0 && (
              <span className="ml-1.5 rounded-full bg-accent/20 px-1.5 text-[10px] text-accent">
                {selectedCaps.length}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CAPABILITIES.map((c) => {
              const on = selectedCaps.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  title={c.why}
                  onClick={() => toggleCapability(c.key)}
                  aria-pressed={on}
                  className={`focus-ring cursor-help rounded-chip border px-2.5 py-1 text-xs transition-colors ${
                    on
                      ? "border-accent/50 bg-accent/15 text-ink"
                      : "border-line bg-surface-2/40 text-muted hover:text-ink"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <RangeSlider
          label="Length (LOA)"
          min={loaBounds.min}
          max={loaBounds.max}
          step={metric ? 0.5 : 1}
          value={loaValue}
          onChange={handleLength}
          unit={lengthUnit(unit)}
        />
        <RangeSlider
          label="Total horsepower"
          min={facets.totalHp.min}
          max={facets.totalHp.max}
          step={25}
          value={filters.hp}
          onChange={(v) => patch({ hp: v })}
          unit="hp"
          format={(n) => String(Math.round(n))}
        />
        <RangeSlider
          label="Model year"
          min={facets.years.min}
          max={facets.years.max}
          step={1}
          value={filters.years}
          onChange={(v) => patch({ years: v })}
          format={(n) => String(Math.round(n))}
        />

        <div className="h-px bg-line" />

        <ChipGroup
          title="Category"
          options={facets.categories}
          selected={filters.categories}
          labels={CATEGORY_LABELS}
          onToggle={toggleCategory}
        />
        <ChipGroup
          title="Hull type"
          options={facets.hullTypes}
          selected={filters.hullTypes}
          labels={HULL_TYPE_LABELS}
          onToggle={toggleHullType}
        />
        <ChipGroup
          title="Propulsion"
          options={facets.propulsions}
          selected={filters.propulsions}
          labels={PROPULSION_LABELS}
          onToggle={togglePropulsion}
        />
        <ChipGroup
          title="Hull material"
          options={facets.hullMaterials}
          selected={filters.hullMaterials}
          labels={HULL_MATERIAL_LABELS}
          onToggle={toggleHullMaterial}
        />
      </div>
    </div>
  );
}
