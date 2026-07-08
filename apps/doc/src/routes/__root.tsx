import type { ReactNode } from "react";
import {
  HeadContent,
  Scripts,
  createRootRoute,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider } from "raft-ui";

import { PreviewThemeProvider } from "#/components/preview-theme.tsx";
import { Sidebar } from "#/components/sidebar.tsx";
import fontsCss from "raft-ui/fonts.css?url";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "description",
        content: "A React component library built on Base UI and styled with tailwind-variants.",
      },
      {
        name: "theme-color",
        // oklch equivalent of #FFD700 (modern browsers; others skip the chrome tint).
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
  const isStandalonePage = useMatches({
    select: (matches) => matches.some((match) => match.staticData?.standalone === true),
  });
  const documentTitle = getDocumentTitle(location.pathname);

  return (
    <html lang="en" data-theme="elegant" className="light">
      <head>
        <title>{documentTitle}</title>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider theme="elegant" mode="light">
          <PreviewThemeProvider>
            <div
              className={
                isStandalonePage
                  ? "isolate min-h-screen [--sidebar-w:0rem] [--toc-w:0rem]"
                  : "isolate min-h-screen [--sidebar-w:0rem] [--toc-w:0rem] lg:[--sidebar-w:13.5rem] xl:[--toc-w:11rem]"
              }
            >
              {isStandalonePage ? null : <Sidebar />}
              <main className="min-h-screen pl-[var(--sidebar-w)]">{children}</main>
            </div>
          </PreviewThemeProvider>
        </ThemeProvider>
        {isStandalonePage ? null : (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
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
