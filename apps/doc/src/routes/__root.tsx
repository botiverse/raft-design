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
import { cn } from "@botiverse/raft-ui/cn";

import { PreviewThemeProvider, usePreviewTheme } from "#/components/preview-theme.tsx";
import { shortTitle } from "#/lib/content/nav.ts";
import { pageAt, SECTIONS } from "#/lib/content/pages.ts";
import { redirectFor } from "#/lib/content/redirects.ts";
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
  beforeLoad: ({ location }) => {
    const target = redirectFor(location.pathname);
    if (target) throw redirect({ href: target, statusCode: 301 });
  },
  loader: async () => ({
    storedPreviewTheme:
      typeof document === "undefined"
        ? await getStoredPreviewTheme()
        : readPreviewThemeCookieFromDocument(),
  }),
  head: () => ({
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

function RootDocument({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { storedPreviewTheme } = Route.useLoaderData();
  const isStandalonePage = useMatches({
    select: (matches) => matches.some((match) => match.staticData?.standalone === true),
  });
  const isPlaygroundPage = isStandalonePage && location.pathname.startsWith("/playground");
  const isPlaygroundChatPage = isPlaygroundPage && location.pathname.startsWith("/playground/s/");
  const usesPlaygroundDocumentScroll = isPlaygroundPage && !isPlaygroundChatPage;
  const documentTitle = getDocumentTitle(location.pathname);
  // The document mode follows the stored selection. One mapping shared by the
  // SSR markup, the pre-paint script in <head>, and `DocumentThemeProvider`'s
  // effect.
  const documentMode = documentThemeMode(storedPreviewTheme);
  const documentShellClassName = cn(
    "isolate h-full",
    usesPlaygroundDocumentScroll && "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible",
  );

  return (
    <html
      lang="en"
      data-standalone={isStandalonePage || undefined}
      style={{ colorScheme: documentMode }}
      className={cn(
        documentMode,
        usesPlaygroundDocumentScroll &&
          "max-md:!h-auto max-md:!overflow-visible max-md:!overscroll-auto max-md:!bg-layer-sidebar",
      )}
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
            ? cn(
                "h-dvh overflow-hidden overscroll-none bg-layer-sidebar text-foreground antialiased",
                usesPlaygroundDocumentScroll &&
                  "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible max-md:!overscroll-auto max-md:!bg-layer-sidebar",
              )
            : "bg-layer-canvas text-foreground antialiased dark:bg-layer-sidebar"
        }
      >
        <PreviewThemeProvider initial={storedPreviewTheme}>
          <DocumentThemeProvider>
            {/* Every page brings its own chrome: the docs shell (routes/_site),
                Playground, or a bare iframe fixture. */}
            <div className={documentShellClassName}>{children}</div>
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

const SECTION_TITLES: Record<string, string> = {
  "/changelog": "Changelog",
  ...Object.fromEntries(SECTIONS.map((section) => [`/${section.id}`, section.title])),
};

function getDocumentTitle(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const title = pageAt(path) ? shortTitle(pageAt(path)!) : SECTION_TITLES[path];
  return title ? `${title} · Raft Design System` : "Raft Design System";
}
