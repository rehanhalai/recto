const CACHE_VERSION = "recto-v2";
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/favicon/site.webmanifest",
  "/favicon/web-app-manifest-192x192.png",
  "/favicon/web-app-manifest-512x512.png",
];

const IS_LOCALHOST =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

self.addEventListener("install", (event) => {
  if (IS_LOCALHOST) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (IS_LOCALHOST) {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        const registration = await self.registration;
        await registration.unregister();
      })(),
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (IS_LOCALHOST) return;

  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Never intercept Next internals or image optimizer requests.
  if (requestUrl.pathname.startsWith("/_next/")) {
    return;
  }

  // For navigation requests, prefer network and fall back to offline page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match("/offline.html");
        }),
    );
    return;
  }

  // Cache only safe same-origin static assets.
  const isStaticAsset = ["style", "script", "image", "font"].includes(
    event.request.destination,
  );

  if (!isStaticAsset) {
    return;
  }

  // For same-origin static assets, prefer cache then network.
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request)
            .then((response) => {
              const responseClone = response.clone();
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(event.request, responseClone));
              return response;
            })
            .catch(async () => {
              const fallback = await caches.match(event.request);
              return fallback || Response.error();
            }),
      ),
    );
  }
});
