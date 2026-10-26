"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SortingState } from "@tanstack/react-table";
import type {
  ManufacturerCatalog,
  ManufacturerSummary,
  Facets,
  ExplorerFilters,
  UnitSystem,
  Theme,
  BoatCategory,
  HullType,
  Propulsion,
  HullMaterial,
} from "@/lib/types";
import { fullFilters } from "@/lib/filters";
import { DEFAULT_COLUMN_VISIBILITY } from "@/lib/columns";

export type LoadStatus = "idle" | "loading" | "ready" | "error" | "notfound";

const EMPTY_FILTERS: ExplorerFilters = {
  length: { min: 0, max: 0 },
  hp: { min: 0, max: 0 },
  years: { min: 0, max: 0 },
  categories: [],
  hullTypes: [],
  propulsions: [],
  hullMaterials: [],
  search: "",
};

interface ExplorerState {
  // selection + fetched data
  selectedSlug: string | null;
  catalog: ManufacturerCatalog | null;
  facets: Facets | null;
  status: LoadStatus;
  error: string | null;

  // the manufacturer directory (loaded once for the picker + welcome grid)
  manufacturers: ManufacturerSummary[];
  manufacturersStatus: LoadStatus;
  manufacturersError: string | null;

  // transient view state (mirrored to the URL by the page)
  filters: ExplorerFilters;
  sorting: SortingState;
  selectedBoatId: string | null;

  // persisted personal prefs (localStorage)
  unit: UnitSystem;
  theme: Theme;
  speedMph: boolean;
  columnVisibility: Record<string, boolean>;

  // actions
  loadManufacturers: () => Promise<void>;
  loadManufacturer: (slug: string | null) => Promise<void>;
  retry: () => void;
  setFilters: (f: ExplorerFilters) => void;
  patchFilters: (p: Partial<ExplorerFilters>) => void;
  resetFilters: () => void;
  toggleCategory: (c: BoatCategory) => void;
  toggleHullType: (h: HullType) => void;
  togglePropulsion: (p: Propulsion) => void;
  toggleHullMaterial: (m: HullMaterial) => void;
  setSearch: (s: string) => void;
  setSorting: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void;
  openBoat: (id: string | null) => void;
  setUnit: (u: UnitSystem) => void;
  toggleUnit: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSpeedMph: () => void;
  setColumnVisibility: (v: Record<string, boolean>) => void;
  toggleColumn: (id: string) => void;
}

function applyThemeAttr(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export const useExplorerStore = create<ExplorerState>()(
  persist(
    (set, get) => ({
      selectedSlug: null,
      catalog: null,
      facets: null,
      status: "idle",
      error: null,

      manufacturers: [],
      manufacturersStatus: "idle",
      manufacturersError: null,

      filters: EMPTY_FILTERS,
      sorting: [],
      selectedBoatId: null,

      unit: "imperial",
      theme: "dark",
      speedMph: false,
      columnVisibility: { ...DEFAULT_COLUMN_VISIBILITY },

      loadManufacturers: async () => {
        const st = get();
        if (st.manufacturersStatus === "loading" || st.manufacturers.length) {
          return;
        }
        set({ manufacturersStatus: "loading", manufacturersError: null });
        try {
          const res = await fetch("/api/manufacturers");
          if (!res.ok) throw new Error(`Request failed (${res.status})`);
          const data = (await res.json()) as ManufacturerSummary[];
          set({ manufacturers: data, manufacturersStatus: "ready" });
        } catch (e) {
          set({
            manufacturersStatus: "error",
            manufacturersError:
              e instanceof Error ? e.message : "Failed to load manufacturers",
          });
        }
      },

      loadManufacturer: async (slug) => {
        if (!slug) {
          set({
            selectedSlug: null,
            catalog: null,
            facets: null,
            status: "idle",
            error: null,
            selectedBoatId: null,
          });
          return;
        }

        const st = get();
        // Fetch a manufacturer's catalog exactly once; re-selecting is a no-op.
        if (st.selectedSlug === slug && st.catalog && st.status === "ready") {
          return;
        }

        set({
          selectedSlug: slug,
          status: "loading",
          error: null,
          selectedBoatId: null,
        });

        try {
          const [cRes, fRes] = await Promise.all([
            fetch(`/api/manufacturers/${encodeURIComponent(slug)}`),
            fetch(`/api/facets/${encodeURIComponent(slug)}`),
          ]);

          // A newer selection superseded this one mid-flight — drop the result.
          if (get().selectedSlug !== slug) return;

          if (cRes.status === 404) {
            set({ status: "notfound", catalog: null, facets: null });
            return;
          }
          if (!cRes.ok || !fRes.ok) {
            const body = await cRes.json().catch(() => null);
            throw new Error(
              body?.error?.message ?? `Request failed (${cRes.status})`,
            );
          }

          const catalog = (await cRes.json()) as ManufacturerCatalog;
          const facets = (await fRes.json()) as Facets;
          if (get().selectedSlug !== slug) return;

          set({
            catalog,
            facets,
            status: "ready",
            filters: fullFilters(facets),
          });
        } catch (e) {
          if (get().selectedSlug !== slug) return;
          set({
            status: "error",
            error: e instanceof Error ? e.message : "Unexpected error",
          });
        }
      },

      retry: () => {
        void get().loadManufacturer(get().selectedSlug);
      },

      setFilters: (f) => set({ filters: f }),
      patchFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
      resetFilters: () => {
        const f = get().facets;
        if (f) set({ filters: fullFilters(f) });
      },

      toggleCategory: (c) =>
        set((s) => ({
          filters: {
            ...s.filters,
            categories: s.filters.categories.includes(c)
              ? s.filters.categories.filter((x) => x !== c)
              : [...s.filters.categories, c],
          },
        })),
      toggleHullType: (h) =>
        set((s) => ({
          filters: {
            ...s.filters,
            hullTypes: s.filters.hullTypes.includes(h)
              ? s.filters.hullTypes.filter((x) => x !== h)
              : [...s.filters.hullTypes, h],
          },
        })),
      togglePropulsion: (p) =>
        set((s) => ({
          filters: {
            ...s.filters,
            propulsions: s.filters.propulsions.includes(p)
              ? s.filters.propulsions.filter((x) => x !== p)
              : [...s.filters.propulsions, p],
          },
        })),
      toggleHullMaterial: (m) =>
        set((s) => ({
          filters: {
            ...s.filters,
            hullMaterials: s.filters.hullMaterials.includes(m)
              ? s.filters.hullMaterials.filter((x) => x !== m)
              : [...s.filters.hullMaterials, m],
          },
        })),
      setSearch: (search) =>
        set((s) => ({ filters: { ...s.filters, search } })),

      setSorting: (updater) =>
        set((s) => ({
          sorting:
            typeof updater === "function" ? updater(s.sorting) : updater,
        })),

      openBoat: (id) => set({ selectedBoatId: id }),

      setUnit: (u) => set({ unit: u }),
      toggleUnit: () =>
        set((s) => ({ unit: s.unit === "imperial" ? "metric" : "imperial" })),

      setTheme: (t) => {
        applyThemeAttr(t);
        set({ theme: t });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyThemeAttr(next);
        set({ theme: next });
      },
      toggleSpeedMph: () => set((s) => ({ speedMph: !s.speedMph })),

      setColumnVisibility: (v) => set({ columnVisibility: v }),
      toggleColumn: (id) =>
        set((s) => ({
          columnVisibility: {
            ...s.columnVisibility,
            [id]: !(s.columnVisibility[id] ?? true),
          },
        })),
    }),
    {
      name: "hulldata-prefs",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        theme: s.theme,
        unit: s.unit,
        speedMph: s.speedMph,
        columnVisibility: s.columnVisibility,
      }),
      // Merge persisted prefs with defaults so newly added columns still appear.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ExplorerState>;
        return {
          ...current,
          ...p,
          columnVisibility: {
            ...DEFAULT_COLUMN_VISIBILITY,
            ...(p.columnVisibility ?? {}),
          },
        };
      },
    },
  ),
);
