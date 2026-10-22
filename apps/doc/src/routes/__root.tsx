import type { ReactNode } from "react";
import {
  HeadContent,
  Scripts,
  createRootRoute,
  redirect,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { ThemeProvider } from "@botiverse/raft-ui";

import { PreviewThemeProvider, usePreviewTheme } from "#/components/preview-theme.tsx";
import { shortTitle } from "#/lib/content/nav.ts";
import { SITE_ORIGIN } from "#/lib/content/links.ts";
import { localize, pageAt, SECTIONS } from "#/lib/content/pages.ts";
import { redirectFor } from "#/lib/content/redirects.ts";
import {
  DEFAULT_LOCALE,
  LANGUAGE_TAG,
  LOCALES,
  localeOfPath,
  localizePath,
} from "#/lib/i18n/locales.ts";
import type { Locale } from "#/lib/i18n/locales.ts";
import { messagesFor } from "#/lib/i18n/messages.ts";
import {
  documentThemeMode,
  getStoredPreviewTheme,
  PREVIEW_THEME_INLINE_SCRIPT,
  readPreviewThemeCookieFromDocument,
} from "#/lib/preview-theme-storage.ts";
import fontsCss from "@botiverse/raft-ui/fonts.css?url";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  // Old addresses (lib/content/redirects.ts). The root route runs for every
  // path, including ones no route matches any more and `.md` twins.
  // An old path redirects within the language it was asked for.
  beforeLoad: ({ location }) => {
    const target = redirectFor(location.pathname);
    if (target) {
      const href = localizePath(target, localeOfPath(location.publicHref));
      throw redirect({ href, statusCode: 301 });
    }
  },
  loader: async ({ location }) => ({
    // The page's language, from its public URL (lib/i18n/locales.ts); the
    // routes' `head` reads it from here (lib/i18n/head.ts).
    locale: localeOfPath(location.publicHref),
    storedPreviewTheme:
      typeof document === "undefined"
        ? await getStoredPreviewTheme()
        : readPreviewThemeCookieFromDocument(),
  }),
  head: ({ matches }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      {
        name: "description",
        content: "A React component library built on Base UI and styled with tailwind-variants.",
      },
      {
        name: "theme-color",
        // Modern browsers use the OKLCH value; others skip the chrome tint.
        content: "oklch(0.8868 0.1822 95.33)",
      },
    ],
    links: [
      ...languageAlternates(matches.at(-1)?.pathname),
      {
        rel: "stylesheet",
        href: fontsCss,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "any",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),
  shellComponent: RootDocument,
});

/**
 * The page in every language, for search engines: each language's URL, and
 * the English one as the default for any other language.
 */
function languageAlternates(pathname: string | undefined) {
  if (!pathname || pathname.startsWith("/iframe/")) return [];
  const path = pathname.replace(/\/+$/, "") || "/";
  const url = (locale: Locale) => `${SITE_ORIGIN}${localizePath(path, locale)}`;
  return [
    ...LOCALES.map((locale) => ({
      rel: "alternate",
      hrefLang: LANGUAGE_TAG[locale],
      href: url(locale),
    })),
    { rel: "alternate", hrefLang: "x-default", href: url(DEFAULT_LOCALE) },
  ];
}

function RootDocument({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { storedPreviewTheme, locale } = Route.useLoaderData();
  const isStandalonePage = useMatches({
    select: (matches) => matches.some((match) => match.staticData?.standalone === true),
  });
  const documentTitle = getDocumentTitle(location.pathname, locale);
  // The document mode follows the stored selection. One mapping shared by the
  // SSR markup, the pre-paint script in <head>, and `DocumentThemeProvider`'s
  // effect.
  const documentMode = documentThemeMode(storedPreviewTheme);

  return (
    <html
      lang={LANGUAGE_TAG[locale]}
      data-standalone={isStandalonePage || undefined}
      style={{ colorScheme: documentMode }}
      className={documentMode}
    >
      <head>
        {/* Pre-paint: apply the stored mode before the first frame.
            Prerendered + cache-served markup always ships light, and waiting
            for hydration flashes it for ~125ms (measured). This mirrors
            `documentThemeMode`, the SSR attributes above, and
            `DocumentThemeProvider`'s effect. */}
        <script dangerouslySetInnerHTML={{ __html: PREVIEW_THEME_INLINE_SCRIPT }} />
        <title>{documentTitle}</title>
        <HeadContent />
      </head>
      <body
        data-standalone={isStandalonePage || undefined}
        className={
          isStandalonePage
            ? "h-dvh overflow-hidden overscroll-none bg-layer-sidebar text-foreground antialiased"
            : "bg-layer-canvas text-foreground antialiased dark:bg-layer-sidebar"
        }
      >
        <PreviewThemeProvider initial={storedPreviewTheme}>
          <DocumentThemeProvider>
            {/* Every page brings its own chrome: the docs shell (routes/_site)
                or a bare iframe fixture. */}
            <div className="isolate h-full">{children}</div>
          </DocumentThemeProvider>
        </PreviewThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function DocumentThemeProvider({ children }: { children: ReactNode }) {
  const previewTheme = usePreviewTheme();
  return (
    // The whole site follows the picked mode, chrome included, so the docs
    // never show a page that is half light and half dark.
    //
    // syncDom is left ON: this provider owns the mode class on <html>. Nothing
    // else may write it, or the two writers fight over it — which is exactly
    // what produced the half-themed chrome.
    <ThemeProvider mode={previewTheme.mode}>{children}</ThemeProvider>
  );
}

function getDocumentTitle(pathname: string, locale: Locale) {
  const messages = messagesFor(locale);
  const sectionTitles: Record<string, string> = {
    "/changelog": messages.changelog,
    ...Object.fromEntries(
      SECTIONS.map((section) => [`/${section.id}`, messages.sections[section.id].title]),
    ),
  };
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = pageAt(path);
  const title = page ? shortTitle(localize(page, locale)) : sectionTitles[path];
  return title ? `${title} · ${messages.siteName}` : messages.siteName;
}
