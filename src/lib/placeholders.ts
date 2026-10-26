// Maps a powered category to its bundled SVG silhouette in /public/placeholders.
// Used as the seed default thumbnail and as the client-side fallback when a
// remote image fails to load — so a broken image never shows.

import type { BoatCategory } from "./types";

const CATEGORY_PLACEHOLDER: Record<BoatCategory, string> = {
  MOTOR_YACHT: "/placeholders/motor-yacht.svg",
  TRAWLER: "/placeholders/trawler.svg",
  SPORTFISH: "/placeholders/sportfish.svg",
  EXPRESS_CRUISER: "/placeholders/express-cruiser.svg",
  CENTER_CONSOLE: "/placeholders/center-console.svg",
  FLYBRIDGE: "/placeholders/flybridge.svg",
};

export function categoryPlaceholder(category: BoatCategory): string {
  return CATEGORY_PLACEHOLDER[category] ?? "/placeholders/motor-yacht.svg";
}
