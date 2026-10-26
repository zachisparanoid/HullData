/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep Prisma out of the server bundle so the query engine resolves at runtime.
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  images: {
    // Our primary thumbnails are bundled SVG silhouettes. Next's image optimizer
    // rejects SVGs ("not a valid image"), so we serve images unoptimized — the raw
    // /public src is used directly. next/image still gives us lazy-loading and blur
    // placeholders. Vector SVGs need no optimization, and any remote raster URL is
    // served as-is (with the client-side broken-image fallback as a safety net).
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
