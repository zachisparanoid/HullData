"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/store/useFavorites";

/**
 * Heart toggle bound to the persisted favorites store. Renders an inert,
 * unfilled state until mounted so the localStorage-driven fill never causes a
 * hydration mismatch.
 */
export default function FavoriteButton({
  id,
  withLabel = false,
  stopPropagation = true,
  className = "",
}: {
  id: string;
  withLabel?: boolean;
  stopPropagation?: boolean;
  className?: string;
}) {
  const saved = useFavorites((s) => s.ids.includes(id));
  const toggle = useFavorites((s) => s.toggle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && saved;

  const base = withLabel
    ? "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium backdrop-blur transition-colors"
    : "grid place-items-center rounded-md p-1 transition-colors";
  const tone = active
    ? "border-accent/40 bg-accent/15 text-accent"
    : withLabel
      ? "border-line bg-surface-2/80 text-muted hover:text-ink"
      : "text-muted hover:text-accent";

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      title={active ? "Saved — click to remove" : "Save to your shortlist"}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        toggle(id);
      }}
      className={`focus-ring ${base} ${tone} ${className}`}
    >
      <Heart
        className={withLabel ? "h-3.5 w-3.5" : "h-4 w-4"}
        fill={active ? "currentColor" : "none"}
      />
      {withLabel ? <span>{active ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
