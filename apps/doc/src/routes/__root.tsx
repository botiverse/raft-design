import { useState } from "react";
import type { ReactNode } from "react";
import {
  HeadContent,
  Scripts,
  createRootRoute,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { ThemeProvider } from "raft-ui";
import { cn } from "raft-ui/cn";

import { PreviewThemeProvider, usePreviewTheme } from "#/components/preview-theme.tsx";
import { Sidebar } from "#/components/sidebar.tsx";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";
import {
  documentThemeMode,
  getStoredPreviewTheme,
  PREVIEW_THEME_INLINE_SCRIPT,
  readPreviewThemeCookieFromDocument,
} from "#/lib/preview-theme-storage.ts";
import fontsCss from "raft-ui/fonts.css?url";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const documentShellClassName = isStandalonePage
    ? cn(
        "isolate h-full [--sidebar-w:0rem] [--toc-w:0rem]",
        usesPlaygroundDocumentScroll && "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible",
      )
    : cn(
        "isolate min-h-screen [--sidebar-w:0rem] [--toc-w:0rem] lg:[--sidebar-w:16rem] xl:[--toc-w:11rem]",
        sidebarCollapsed && "lg:[--sidebar-w:3.5rem]",
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
        {isMarkdownMode() ? null : <title>{documentTitle}</title>}
        {isMarkdownMode() ? null : <HeadContent />}
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
            <div className={documentShellClassName}>
              {isStandalonePage || isMarkdownMode() ? null : (
                <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
              )}
              <main
                className={
                  isStandalonePage
                    ? cn(
                        "h-full pl-(--sidebar-w)",
                        usesPlaygroundDocumentScroll &&
                          "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible",
                      )
                    : "min-h-screen pl-(--sidebar-w)"
                }
              >
                {children}
              </main>
            </div>
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

function getDocumentTitle(pathname: string) {
  return getComponentTitle(pathname) ?? "Raft Design System";
}

function getComponentTitle(pathname: string) {
  const componentSlug = pathname.match(/^\/components\/([^/]+)/)?.[1]?.replace(/_$/, "");

  if (!componentSlug) {
    return null;
  }

  return componentSlug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}
