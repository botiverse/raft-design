import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { DEFAULT_LOCALE, localeOfPath, localizePath, stripLocale } from "./lib/i18n/locales.ts";
import type { Locale } from "./lib/i18n/locales.ts";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // The language of this router's document. A router serves one document (on
  // the server, one request): switching language loads the other document, so
  // the language read from the first URL holds for every link built after it.
  let locale: Locale = DEFAULT_LOCALE;

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultStaleTime: Number.POSITIVE_INFINITY,
    defaultPreloadStaleTime: Number.POSITIVE_INFINITY,
    // `/zh/foundations/color` is the route `/foundations/color` in Chinese
    // (lib/i18n/locales.ts).
    rewrite: {
      input: ({ url }) => {
        locale = localeOfPath(url.pathname);
        url.pathname = stripLocale(url.pathname);
        return url;
      },
      output: ({ url }) => {
        url.pathname = localizePath(url.pathname, locale);
        return url;
      },
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    standalone?: boolean;
  }
}
