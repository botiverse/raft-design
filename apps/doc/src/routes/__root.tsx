import { useMemo, useState } from "react";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider, type Theme } from "@slock/ui";

import { Sidebar } from "#/components/sidebar.tsx";
import { FamilyContext } from "#/components/family-context.ts";
import { ThemeSwitcher } from "#/components/theme-switcher.tsx";
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
        title: "Slock Design System",
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

function RootDocument({ children }: { children: React.ReactNode }) {
  // Family axis: drives `data-theme` on <html>. Mode axis (.dark) is owned by
  // next-themes on the same element, so [data-theme=elegant].dark resolves.
  const [family, setFamily] = useState<Theme>("brutal");
  const familyValue = useMemo(() => ({ family, setFamily }), [family]);

  return (
    <html lang="en" data-theme={family} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <NextThemesProvider attribute="class" enableSystem defaultTheme="system">
          <ThemeProvider theme={family}>
            <FamilyContext.Provider value={familyValue}>
              <div className="isolate min-h-screen [--rail-w:0rem] lg:[--rail-w:20rem]">
                <Sidebar />
                <main className="min-h-screen pl-[var(--rail-w)]">{children}</main>
              </div>
              <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
                <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
                  <ThemeSwitcher />
                </div>
              </div>
            </FamilyContext.Provider>
          </ThemeProvider>
        </NextThemesProvider>
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
        <Scripts />
      </body>
    </html>
  );
}
