// HullData service worker — offline reads for dock use.
//
// Caching rules are chosen to never serve a stale reference to a versioned
// build asset (which 404s after a deploy):
//   • content-hashed immutable assets (/_next/static, photos, icon) → cache-first
//   • the models API → stale-while-revalidate (data, safe to be briefly stale)
//   • page navigations + everything else (RSC, _next/data) → network-first
//     with a cached fallback, so online users always get the current build.
// Bump CACHE to invalidate everything from a previous version.

const CACHE = "hulldata-v2";
const IMMUTABLE = /\/(?:_next\/static|boats|brands|placeholders)\/|\/icon\.svg$/;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled([c.add("/"), c.add("/explore"), c.add("/learn")]),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // pass cross-origin through

  // Content-hashed immutable assets: cache-first (a new build ships new hashes).
  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Models dataset: stale-while-revalidate so /explore opens instantly offline.
  if (url.pathname === "/api/models") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Navigations + everything else (RSC, _next/data): network-first so a deploy
  // never leaves us pointing at a deleted chunk; fall back to cache when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && req.mode === "navigate") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") return caches.match("/");
        return Response.error();
      }),
  );
});
