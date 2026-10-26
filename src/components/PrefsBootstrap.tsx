"use client";

import { useEffect } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";

// Rehydrate persisted prefs after mount (the store uses skipHydration to avoid
// an SSR mismatch), then make sure the <html data-theme> attribute matches the
// stored theme. The inline <head> script already set it pre-paint, so there's
// no flash — this just reconciles after the store hydrates.
export default function PrefsBootstrap() {
  useEffect(() => {
    const result = useExplorerStore.persist.rehydrate();
    Promise.resolve(result).then(() => {
      const theme = useExplorerStore.getState().theme;
      document.documentElement.setAttribute("data-theme", theme);
    });
  }, []);
  return null;
}
