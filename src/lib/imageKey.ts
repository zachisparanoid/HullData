// Canonical key for matching a dropped-in image file to a boat model by name.
// Must stay in sync with the identical helper in scripts/sync-images.mjs.
export function modelKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
