"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  AlertTriangle,
  Compass,
  SearchX,
  RotateCcw,
} from "lucide-react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { applyFilters, suggestRelaxation } from "@/lib/filters";
import { buildQuery, parseFilters } from "@/lib/urlState";
import FilterPanel from "@/components/FilterPanel";
import StatStrip from "@/components/StatStrip";
import BoatTable from "@/components/BoatTable";
import BoatDetailDrawer from "@/components/BoatDetailDrawer";
import WelcomeScreen from "@/components/WelcomeScreen";
import SkeletonTable from "@/components/SkeletonTable";
import EmptyState from "@/components/EmptyState";
import ColumnVisibilityMenu from "@/components/ColumnVisibilityMenu";

export default function Explorer() {
  const router = useRouter();
  const sp = useSearchParams();
  const m = sp.get("m");

  // Always-current snapshot of the query string for effects that must NOT
  // re-run on every URL change (capturing deep-link filters at load time).
  const spRef = useRef(sp);
  spRef.current = sp;

  const loadManufacturers = useExplorerStore((s) => s.loadManufacturers);
  const loadManufacturer = useExplorerStore((s) => s.loadManufacturer);
  const setFilters = useExplorerStore((s) => s.setFilters);
  const resetFilters = useExplorerStore((s) => s.resetFilters);
  const retry = useExplorerStore((s) => s.retry);
  const openBoat = useExplorerStore((s) => s.openBoat);

  const status = useExplorerStore((s) => s.status);
  const error = useExplorerStore((s) => s.error);
  const catalog = useExplorerStore((s) => s.catalog);
  const facets = useExplorerStore((s) => s.facets);
  const selectedSlug = useExplorerStore((s) => s.selectedSlug);
  const filters = useExplorerStore((s) => s.filters);
  const selectedBoatId = useExplorerStore((s) => s.selectedBoatId);

  const appliedSlugRef = useRef<string | null>(null);
  const pendingQueryRef = useRef<string>("");

  const [sheetOpen, setSheetOpen] = useState(false);

  const go = useCallback(
    (slug: string) =>
      router.push(`/?m=${encodeURIComponent(slug)}`, { scroll: false }),
    [router],
  );

  // 1) Load the manufacturer directory once.
  useEffect(() => {
    void loadManufacturers();
  }, [loadManufacturers]);

  // 2) When the selected manufacturer (?m) changes, capture the deep-link query
  //    so we can apply its filters after the catalog loads, then fetch it.
  useEffect(() => {
    appliedSlugRef.current = null;
    pendingQueryRef.current = spRef.current.toString();
    void loadManufacturer(m);
    setSheetOpen(false);
    // Intentionally depends only on `m`: re-running on every query change would
    // re-capture/re-apply filters and clobber the user's edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  // 3) Once the catalog is ready, apply the captured deep-link filters + boat
  //    exactly once for this manufacturer.
  useEffect(() => {
    if (status !== "ready" || !facets || !catalog || selectedSlug !== m || !m)
      return;
    if (appliedSlugRef.current === m) return;

    const params = new URLSearchParams(pendingQueryRef.current);
    setFilters(parseFilters(params, facets));
    const boat = params.get("boat");
    openBoat(boat && catalog.models.some((x) => x.id === boat) ? boat : null);
    appliedSlugRef.current = m;
  }, [status, facets, catalog, selectedSlug, m, setFilters, openBoat]);

  // 4) Mirror filters + open boat back into the URL (debounced, replaceState).
  useEffect(() => {
    if (status !== "ready" || !facets || !m) return;
    if (appliedSlugRef.current !== m) return;
    const handle = setTimeout(() => {
      router.replace(`/${buildQuery(m, filters, facets, selectedBoatId)}`, {
        scroll: false,
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [filters, selectedBoatId, status, facets, m, router]);

  const filtered = useMemo(
    () =>
      catalog && facets ? applyFilters(catalog.models, filters, facets) : [],
    [catalog, facets, filters],
  );

  const total = catalog?.models.length ?? 0;
  const shown = filtered.length;

  // --- No manufacturer selected: welcome + card grid ---
  if (!m) {
    return (
      <>
        <WelcomeScreen onSelect={go} />
        <BoatDetailDrawer />
      </>
    );
  }

  // --- Manufacturer not found (bad deep link) ---
  if (status === "notfound") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="panel">
          <EmptyState
            icon={<Compass className="h-7 w-7" />}
            title="Manufacturer not found"
            description={
              <>
                No builder matches{" "}
                <span className="num text-ink">“{m}”</span>. It may have been
                renamed or removed.
              </>
            }
            action={
              <button
                type="button"
                onClick={() => router.push("/", { scroll: false })}
                className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#06231f] transition-colors hover:bg-accent-strong"
              >
                Back to all builders
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // --- Error ---
  if (status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="panel border-danger/30">
          <EmptyState
            tone="danger"
            icon={<AlertTriangle className="h-7 w-7" />}
            title="Couldn't load this catalog"
            description={error ?? "An unexpected error occurred."}
            action={
              <button
                type="button"
                onClick={retry}
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
  if (status !== "ready" || !facets || !catalog) {
    return (
      <div className="mx-auto max-w-[1700px] px-4 py-4">
        <SkeletonTable rows={10} />
        <BoatDetailDrawer />
      </div>
    );
  }

  // --- Ready: two-pane explorer ---
  return (
    <div className="mx-auto h-[calc(100vh-3.5rem)] max-w-[1700px] px-4">
      <div className="flex h-full gap-4 py-4">
        {/* Desktop filter rail */}
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <div className="panel h-full overflow-hidden">
            <FilterPanel shown={shown} total={total} />
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
            <div className="shrink-0">
              <ColumnVisibilityMenu />
            </div>
          </div>

          <div className="panel min-h-0 flex-1 overflow-hidden">
            {shown > 0 ? (
              <BoatTable models={filtered} />
            ) : (
              <EmptyState
                icon={<SearchX className="h-7 w-7" />}
                title="No models match these filters"
                description={
                  suggestRelaxation(catalog.models, filters, facets) ??
                  "Try loosening your filters to see more models."
                }
                action={
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="focus-ring flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent/40"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset filters
                  </button>
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
              <FilterPanel
                shown={shown}
                total={total}
                onClose={() => setSheetOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BoatDetailDrawer />
    </div>
  );
}
