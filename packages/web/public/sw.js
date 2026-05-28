const ASSET_CACHE = "slock-assets-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith("slock-assets-") && k !== ASSET_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Cache-first for hashed build assets (immutable by Vite's content hash).
// Lets the PWA resume from disk when Android Chrome kills the backgrounded tab.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("/assets/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const response = await fetch(req);
      if (response.ok) cache.put(req, response.clone()).catch(() => {});
      return response;
    })(),
  );
});

function isSameNotificationTarget(clientUrl, targetUrl) {
  try {
    const client = new URL(clientUrl);
    const target = new URL(targetUrl, self.location.origin);
    if (client.origin !== target.origin) return false;
    if (client.pathname !== target.pathname) return false;

    const targetThread = target.searchParams.get("thread");
    if (targetThread) {
      return client.searchParams.get("thread") === targetThread;
    }

    return true;
  } catch {
    return false;
  }
}

function getPushNotificationData(event) {
  if (!event.data) return {};

  let text;
  try {
    text = event.data.text();
  } catch {
    return {
      title: "Slock",
      body: "New activity",
    };
  }

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      title: "Slock",
      body: text,
    };
  }
}

self.addEventListener("push", (event) => {
  const data = getPushNotificationData(event);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const targetUrl = data.url || "/";
      const shouldSuppress = !data.alwaysShow && clients.some((client) => {
        const isActive = client.focused || client.visibilityState === "visible";
        return isActive && isSameNotificationTarget(client.url, targetUrl);
      });
      if (shouldSuppress) return;

      return self.registration.showNotification(data.title || "Slock", {
        body: data.body || "New activity",
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        tag: data.tag || "slock-push",
        data: { url: targetUrl },
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if (!client.url.startsWith(self.location.origin)) continue;
        if ("navigate" in client) {
          await client.navigate(targetUrl).catch(() => {});
        }
        await client.focus();
        return;
      }
      await self.clients.openWindow(targetUrl);
    }),
  );
});
