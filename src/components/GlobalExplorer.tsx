"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  AlertTriangle,
  SearchX,
  RotateCcw,
  Heart,
} from "lucide-react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useFavorites } from "@/store/useFavorites";
import { applyFilters, suggestRelaxation } from "@/lib/filters";
import { CAPABILITY_BY_KEY } from "@/lib/derived";
import GlobalFilterPanel from "@/components/GlobalFilterPanel";
import StatStrip from "@/components/StatStrip";
import GlobalBoatTable from "@/components/GlobalBoatTable";
import GlobalDetailDrawer from "@/components/GlobalDetailDrawer";
import CompareTray from "@/components/CompareTray";
import CompareView from "@/components/CompareView";
import SkeletonTable from "@/components/SkeletonTable";
import EmptyState from "@/components/EmptyState";
import ColumnVisibilityMenu from "@/components/ColumnVisibilityMenu";

export default function GlobalExplorer() {
  const load = useGlobalStore((s) => s.load);
  const status = useGlobalStore((s) => s.status);
  const error = useGlobalStore((s) => s.error);
  const boats = useGlobalStore((s) => s.boats);
  const facets = useGlobalStore((s) => s.facets);
  const filters = useGlobalStore((s) => s.filters);
  const selectedManu = useGlobalStore((s) => s.selectedManufacturers);
  const selectedCaps = useGlobalStore((s) => s.selectedCapabilities);
  const resetFilters = useGlobalStore((s) => s.resetFilters);
  const setManufacturers = useGlobalStore((s) => s.setManufacturers);
  const favIds = useFavorites((s) => s.ids);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!facets) return [];
    let out = applyFilters(boats, filters, facets);
    if (selectedManu.length) {
      const set = new Set(selectedManu);
      out = out.filter((b) => set.has(b.manufacturerSlug));
    }
    if (selectedCaps.length) {
      out = out.filter((b) =>
        selectedCaps.every((k) => CAPABILITY_BY_KEY[k].test(b)),
      );
    }
    if (favOnly) {
      const f = new Set(favIds);
      out = out.filter((b) => f.has(b.id));
    }
    return out;
  }, [boats, filters, facets, selectedManu, selectedCaps, favOnly, favIds]);

  const noFavs = favOnly && favIds.length === 0;

  const total = boats.length;
  const shown = filtered.length;

  // When the manufacturer filter alone is responsible for an empty result,
  // point at it first; otherwise fall back to the generic relaxation hint.
  const emptyHint = useMemo(() => {
    if (!facets) return null;
    if (
      selectedManu.length > 0 &&
      applyFilters(boats, filters, facets).length > 0
    ) {
      return "Try clearing the builder filter — your other filters still match boats.";
    }
    return suggestRelaxation(boats, filters, facets);
  }, [boats, filters, facets, selectedManu]);

  // --- Error ---
  if (status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="panel border-danger/30">
          <EmptyState
            tone="danger"
            icon={<AlertTriangle className="h-7 w-7" />}
            title="Couldn't load the catalog"
            description={error ?? "An unexpected error occurred."}
            action={
              <button
                type="button"
                onClick={() => void load()}
                className="focus-ring flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#06231f] transition-colors hover:bg-accent-strong"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // --- Loading skeleton ---
  if (status !== "ready" || !facets) {
    return (
      <div className="mx-auto max-w-[1700px] px-4 py-4">
        <SkeletonTable rows={12} />
      </div>
    );
  }

  // --- Ready ---
  return (
    <div className="mx-auto h-[calc(100vh-3.5rem)] max-w-[1700px] px-4">
      <div className="flex h-full gap-4 py-4">
        {/* Desktop filter rail */}
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <div className="panel h-full overflow-hidden">
            <GlobalFilterPanel shown={shown} total={total} />
          </div>
        </aside>

        {/* Main column */}
        <section className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="focus-ring flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-xs text-muted hover:text-ink lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>
              <StatStrip models={filtered} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setFavOnly((v) => !v)}
                aria-pressed={favOnly}
                title="Show only your saved boats"
                className={`focus-ring flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  favOnly
                    ? "border-accent/50 bg-accent/15 text-ink"
                    : "border-line bg-surface-2/60 text-muted hover:text-ink"
                }`}
              >
                <Heart
                  className="h-3.5 w-3.5"
                  fill={favOnly ? "currentColor" : "none"}
                />
                <span className="hidden sm:inline">Favorites</span>
                {favIds.length > 0 && (
                  <span className="num">{favIds.length}</span>
                )}
              </button>
              <ColumnVisibilityMenu />
            </div>
          </div>

          <div className="panel min-h-0 flex-1 overflow-hidden">
            {shown > 0 ? (
              <GlobalBoatTable boats={filtered} />
            ) : noFavs ? (
              <EmptyState
                icon={<Heart className="h-7 w-7" />}
                title="No saved boats yet"
                description="Tap the heart on any boat to add it to your shortlist, then come back here to line them up and compare."
                action={
                  <button
                    type="button"
                    onClick={() => setFavOnly(false)}
                    className="focus-ring flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent/40"
                  >
                    Show all boats
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={<SearchX className="h-7 w-7" />}
                title="No boats match these filters"
                description={
                  emptyHint ?? "Try loosening your filters to see more boats."
                }
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {selectedManu.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setManufacturers([])}
                        className="focus-ring rounded-lg border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent/40"
                      >
                        Clear builders
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="focus-ring flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent/40"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset all filters
                    </button>
                  </div>
                }
              />
            )}
          </div>
        </section>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="absolute inset-0 bg-[var(--scrim)]"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: 0.18 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="absolute left-0 top-0 h-full w-[320px] max-w-[85%] border-r border-line bg-surface"
              variants={{ hidden: { x: "-100%" }, visible: { x: 0 } }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlobalFilterPanel
                shown={shown}
                total={total}
                onClose={() => setSheetOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareTray onOpen={() => setCompareOpen(true)} />
      {compareOpen && <CompareView onClose={() => setCompareOpen(false)} />}
      <GlobalDetailDrawer />
    </div>
  );
}
