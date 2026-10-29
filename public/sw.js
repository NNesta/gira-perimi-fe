// Tsinda Neza service worker: makes the site installable and lets learners keep studying without a connection.
//
//   /_next/static/*, /media/*  cache-first (file names are content-hashed; images never change in place)
//   page navigations            network-first; the last copy of a page is served when offline, or when the network
//                               has not answered within NETWORK_TIMEOUT_MS (a stalled connection)
//   /imyitozo/kwitoza offline   redirected to /imyitozo/offline, which practises from the saved question bank
//   anything else not saved     redirected to /nta-interineti (a redirect, not that page under another address,
//                               so the page hydrates with its own URL)
//   /api, /admin, RSC requests  never cached
//   push                        shows the daily reminder sent by the API; a tap opens the page it names
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
// On a stalled connection a page would stay blank: after this long the saved copy is shown instead, if there is one.
const NETWORK_TIMEOUT_MS = 4000;

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

async function savedPage(cache, url) {
  return (
    (await cache.match(url.pathname + url.search, { ignoreVary: true })) ||
    (await cache.match(url.pathname, { ignoreVary: true, ignoreSearch: true }))
  );
}

async function page(event, url) {
  const cache = await caches.open(PAGES_CACHE);
  const network = fetch(event.request).then((response) => {
    // Exams and redirects (e.g. to /injira) are never kept: an old copy would be wrong. Nor are pages opened from a
    // link with a token in it (sign-in, unsubscribe): the token must not linger on the device.
    const keep = !url.pathname.startsWith("/ikizamini/") && !url.searchParams.has("token");
    if (response.ok && response.type === "basic" && !response.redirected && keep) {
      event.waitUntil(cache.put(url.pathname + url.search, response.clone()).catch(() => undefined));
    }
    return response;
  });
  // If the network is still silent after NETWORK_TIMEOUT_MS, the saved copy (if any) is shown; the network answer
  // keeps loading in the background and refreshes that copy for next time.
  event.waitUntil(network.catch(() => undefined));
  let timer;
  const stalled = new Promise((resolve) => {
    timer = setTimeout(() => resolve(savedPage(cache, url)), NETWORK_TIMEOUT_MS);
  });
  try {
    return (await Promise.race([network, stalled])) || (await network);
  } catch {
    if (url.pathname === "/imyitozo/kwitoza") {
      return Response.redirect(OFFLINE_PRACTICE + url.search, 302);
    }
    const cached = await savedPage(cache, url);
    if (cached) return cached;
    if (url.pathname === OFFLINE_PAGE) return Response.error();
    return Response.redirect(`${OFFLINE_PAGE}?from=${encodeURIComponent(url.pathname + url.search)}`, 302);
  } finally {
    clearTimeout(timer);
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
    event.respondWith(page(event, url));
  }
});

self.addEventListener("push", (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(message.title || "Tsinda Neza", {
      body: message.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: message.tag || "tsinda-neza",
      lang: "rw",
      data: { url: message.url || "/ikibaho" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/ikibaho", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      if (open) {
        const focused = await open.focus();
        return focused.navigate(url).catch(() => self.clients.openWindow(url));
      }
      return self.clients.openWindow(url);
    }),
  );
});
