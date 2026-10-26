import type { MetadataRoute } from "next";

// Installable PWA so HullData can be pinned and used at the dock. Pair with the
// service worker (public/sw.js) for offline reads after a first online visit.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HullData — Powerboat Reference Library",
    short_name: "HullData",
    description:
      "An interactive reference library of production powerboats — search, compare, and learn across every builder, online or at the dock.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
    categories: ["reference", "education", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
