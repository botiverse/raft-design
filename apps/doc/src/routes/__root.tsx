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
import {
  getStoredPreviewTheme,
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
  const isStandalonePage = useMatches({
    select: (matches) => matches.some((match) => match.staticData?.standalone === true),
  });
  const isPlaygroundPage = isStandalonePage && location.pathname.startsWith("/playground");
  const isPlaygroundChatPage = isPlaygroundPage && location.pathname.startsWith("/playground/s/");
  const usesPlaygroundDocumentScroll = isPlaygroundPage && !isPlaygroundChatPage;
  const documentTitle = getDocumentTitle(location.pathname);
  const isDarkDocument =
    storedPreviewTheme?.theme === "elegant" && storedPreviewTheme.mode === "dark";

  return (
    <html
      lang="en"
      data-standalone={isStandalonePage || undefined}
      data-theme="elegant"
      style={{ colorScheme: isDarkDocument ? "dark" : "light" }}
      className={cn(
        isDarkDocument ? "dark" : "light",
        usesPlaygroundDocumentScroll &&
          "max-md:!h-auto max-md:!overflow-visible max-md:!overscroll-auto max-md:!bg-layer-page",
      )}
    >
      <head>
        <title>{documentTitle}</title>
        <HeadContent />
      </head>
      <body
        data-standalone={isStandalonePage || undefined}
        className={
          isStandalonePage
            ? cn(
                "h-dvh overflow-hidden overscroll-none bg-layer-page text-foreground-strong antialiased",
                usesPlaygroundDocumentScroll &&
                  "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible max-md:!overscroll-auto max-md:!bg-layer-page",
              )
            : "bg-layer-panel text-foreground-strong antialiased dark:bg-layer-page"
        }
      >
        <PreviewThemeProvider initial={storedPreviewTheme}>
          <DocumentThemeProvider standalone={isStandalonePage}>
            <div
              className={
                isStandalonePage
                  ? cn(
                      "isolate h-full [--sidebar-w:0rem] [--toc-w:0rem]",
                      usesPlaygroundDocumentScroll &&
                        "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible",
                    )
                  : "isolate min-h-screen [--sidebar-w:0rem] [--toc-w:0rem] lg:[--sidebar-w:13.5rem] xl:[--toc-w:11rem]"
              }
            >
              {isStandalonePage ? null : <Sidebar />}
              <main
                className={
                  isStandalonePage
                    ? cn(
                        "h-full pl-[var(--sidebar-w)]",
                        usesPlaygroundDocumentScroll &&
                          "max-md:!h-auto max-md:!min-h-dvh max-md:!overflow-visible",
                      )
                    : "min-h-screen pl-[var(--sidebar-w)]"
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

function DocumentThemeProvider({
  children,
  standalone,
}: {
  children: ReactNode;
  standalone: boolean;
}) {
  const previewTheme = usePreviewTheme();
  return (
    <ThemeProvider
      theme={standalone ? previewTheme.theme : "elegant"}
      mode={
        previewTheme.theme === "elegant"
          ? previewTheme.mode
          : standalone
            ? previewTheme.mode
            : "light"
      }
    >
      {children}
    </ThemeProvider>
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
