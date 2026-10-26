// Tsinda Neza service worker: makes the site installable and lets learners keep studying without a connection.
//
//   /_next/static/*, /media/*  cache-first (file names are content-hashed; images never change in place)
//   page navigations            network-first; the last copy of a page is served when offline
//   /imyitozo/kwitoza offline   redirected to /imyitozo/offline, which practises from the saved question bank
//   anything else not saved     redirected to /nta-interineti (a redirect, not that page under another address,
//                               so the page hydrates with its own URL)
//   /api, /admin, RSC requests  never cached
//
// Cache names are shared with src/lib/offline.ts: keep them in sync.

const PAGES_CACHE = "gp-pages-v1";
const STATIC_CACHE = "gp-static-v1";
const MEDIA_CACHE = "gp-media-v1";
const PACK_CACHE = "gp-pack-v1";
const KNOWN_CACHES = [PAGES_CACHE, STATIC_CACHE, MEDIA_CACHE, PACK_CACHE];

const OFFLINE_PAGE = "/nta-interineti";
const OFFLINE_PRACTICE = "/imyitozo/offline";
const PRECACHE = [OFFLINE_PAGE, OFFLINE_PRACTICE];
// Scripts and styles are content-hashed, so each deploy leaves old ones behind; drop those not fetched for 60 days.
const STATIC_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) =>
            fetch(url, { credentials: "same-origin" })
              .then((response) => (response.ok && !response.redirected ? cache.put(url, response) : undefined))
              .catch(() => undefined),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

async function pruneStatic() {
  const cache = await caches.open(STATIC_CACHE);
  const cutoff = Date.now() - STATIC_MAX_AGE_MS;
  for (const request of await cache.keys()) {
    const response = await cache.match(request);
    const date = Date.parse(response?.headers.get("date") ?? "");
    if (Number.isFinite(date) && date < cutoff) await cache.delete(request);
  }
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name.startsWith("gp-") && !KNOWN_CACHES.includes(name)).map((name) => caches.delete(name))),
      )
      .then(pruneStatic)
      .catch(() => undefined)
      .then(() => self.clients.claim()),
  );
});

function isRscRequest(request, url) {
  return request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") cache.put(request, response.clone());
  return response;
}

async function page(request, url) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    // Exams and redirects (e.g. to /injira) are never kept: an old copy would be wrong.
    if (response.ok && response.type === "basic" && !response.redirected && !url.pathname.startsWith("/ikizamini/")) {
      cache.put(url.pathname + url.search, response.clone());
    }
    return response;
  } catch {
    if (url.pathname === "/imyitozo/kwitoza") {
      return Response.redirect(OFFLINE_PRACTICE + url.search, 302);
    }
    const cached =
      (await cache.match(url.pathname + url.search, { ignoreVary: true })) ||
      (await cache.match(url.pathname, { ignoreVary: true, ignoreSearch: true }));
    if (cached) return cached;
    if (url.pathname === OFFLINE_PAGE) return Response.error();
    return Response.redirect(`${OFFLINE_PAGE}?from=${encodeURIComponent(url.pathname + url.search)}`, 302);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || isRscRequest(request, url)) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (url.pathname.startsWith("/media/")) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
  } else if (request.mode === "navigate") {
    event.respondWith(page(request, url));
  }
});
