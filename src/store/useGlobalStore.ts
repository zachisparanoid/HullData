"use client";

import { create } from "zustand";
import type { SortingState } from "@tanstack/react-table";
import type {
  GlobalBoat,
  Facets,
  ExplorerFilters,
  BoatCategory,
  HullType,
  Propulsion,
  HullMaterial,
} from "@/lib/types";
import { computeFacets } from "@/lib/facets";
import { fullFilters } from "@/lib/filters";
import type { CapabilityKey } from "@/lib/derived";

export type GlobalStatus = "idle" | "loading" | "ready" | "error";

export const MAX_COMPARE = 4;

interface ManufacturerOption {
  slug: string;
  name: string;
}

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

interface GlobalState {
  boats: GlobalBoat[];
  facets: Facets | null;
  manufacturers: ManufacturerOption[];
  status: GlobalStatus;
  error: string | null;

  filters: ExplorerFilters;
  /** Selected manufacturer slugs; empty = all builders. */
  selectedManufacturers: string[];
  /** Required capability flags (AND); empty = no capability filter. */
  selectedCapabilities: CapabilityKey[];
  sorting: SortingState;
  selectedBoatId: string | null;
  compareIds: string[];

  load: () => Promise<void>;
  patchFilters: (p: Partial<ExplorerFilters>) => void;
  setSearch: (s: string) => void;
  toggleCategory: (c: BoatCategory) => void;
  toggleHullType: (h: HullType) => void;
  togglePropulsion: (p: Propulsion) => void;
  toggleHullMaterial: (m: HullMaterial) => void;
  toggleManufacturer: (slug: string) => void;
  setManufacturers: (slugs: string[]) => void;
  toggleCapability: (k: CapabilityKey) => void;
  resetFilters: () => void;
  setSorting: (
    u: SortingState | ((old: SortingState) => SortingState),
  ) => void;
  openBoat: (id: string | null) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
  boats: [],
  facets: null,
  manufacturers: [],
  status: "idle",
  error: null,
  filters: EMPTY_FILTERS,
  selectedManufacturers: [],
  selectedCapabilities: [],
  sorting: [],
  selectedBoatId: null,
  compareIds: [],

  load: async () => {
    if (get().status === "loading" || get().boats.length) return;
    set({ status: "loading", error: null });
    try {
      const res = await fetch("/api/models");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const boats = (await res.json()) as GlobalBoat[];
      const facets = computeFacets(boats);
      const seen = new Map<string, string>();
      for (const b of boats)
        if (!seen.has(b.manufacturerSlug))
          seen.set(b.manufacturerSlug, b.manufacturerName);
      const manufacturers = [...seen.entries()]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      set({
        boats,
        facets,
        manufacturers,
        status: "ready",
        filters: fullFilters(facets),
      });
    } catch (e) {
      set({
        status: "error",
        error: e instanceof Error ? e.message : "Failed to load boats",
      });
    }
  },

  patchFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),
  toggleCategory: (c) =>
    set((s) => ({
      filters: { ...s.filters, categories: toggle(s.filters.categories, c) },
    })),
  toggleHullType: (h) =>
    set((s) => ({
      filters: { ...s.filters, hullTypes: toggle(s.filters.hullTypes, h) },
    })),
  togglePropulsion: (p) =>
    set((s) => ({
      filters: { ...s.filters, propulsions: toggle(s.filters.propulsions, p) },
    })),
  toggleHullMaterial: (m) =>
    set((s) => ({
      filters: {
        ...s.filters,
        hullMaterials: toggle(s.filters.hullMaterials, m),
      },
    })),
  toggleManufacturer: (slug) =>
    set((s) => ({ selectedManufacturers: toggle(s.selectedManufacturers, slug) })),
  setManufacturers: (slugs) => set({ selectedManufacturers: slugs }),
  toggleCapability: (k) =>
    set((s) => ({ selectedCapabilities: toggle(s.selectedCapabilities, k) })),

  resetFilters: () => {
    const f = get().facets;
    if (f)
      set({
        filters: fullFilters(f),
        selectedManufacturers: [],
        selectedCapabilities: [],
      });
  },

  setSorting: (u) =>
    set((s) => ({ sorting: typeof u === "function" ? u(s.sorting) : u })),
  openBoat: (id) => set({ selectedBoatId: id }),
  toggleCompare: (id) =>
    set((s) => {
      if (s.compareIds.includes(id))
        return { compareIds: s.compareIds.filter((x) => x !== id) };
      if (s.compareIds.length >= MAX_COMPARE) return {};
      return { compareIds: [...s.compareIds, id] };
    }),
  clearCompare: () => set({ compareIds: [] }),
}));
