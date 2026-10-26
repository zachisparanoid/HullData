"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// A cross-builder shortlist of model IDs, persisted to localStorage. Model IDs
// are stable cuids shared by the per-builder and global views, so a boat saved
// anywhere is saved everywhere.
interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: "hulldata-favorites" },
  ),
);
