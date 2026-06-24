import { InlineCode } from "raft-ui";
import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { InstallationCopyPrompt } from "#/components/installation-copy-prompt.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "install", title: "Install" },
  { id: "app-shell", title: "App shell" },
  { id: "tailwind", title: "Tailwind" },
  { id: "usage", title: "Usage" },
  { id: "theme", title: "Theme" },
  { id: "requirements", title: "Requirements" },
] as const;

const INSTALLATION_PROMPT = `Add raft-ui to this React app.

Tasks:
1. Run: pnpm add raft-ui
2. Import raft-ui/styles.css once from the global CSS file or root entry.
3. Wrap the app root with ThemeProvider.
4. Add TooltipProvider when the app uses Tooltip.
5. Keep default body portals. Configure portal containers only for iframes, previews, or embedded shells.

Minimal setup:
import "raft-ui/styles.css";
import { ThemeProvider, TooltipProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <YourApp />
      </TooltipProvider>
    </ThemeProvider>
  );
}`;

const SNIPPETS = {
  install: "pnpm add raft-ui",
  installTailwind: "pnpm add -D tailwindcss @tailwindcss/vite",
  vite: `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});`,
  app: `import { Button } from "raft-ui";

export function App() {
  return <Button>Save</Button>;
}`,
  appShell: `import "raft-ui/styles.css";

import { ThemeProvider, TooltipProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <YourApp />
      </TooltipProvider>
    </ThemeProvider>
  );
}`,
  themeSwitching: `import { Button, useTheme } from "raft-ui";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Button onClick={() => setTheme("brutal")}>Brutal</Button>
      <Button onClick={() => setTheme("elegant", { mode: "light" })}>Elegant light</Button>
      <Button onClick={() => setTheme("elegant", { mode: "dark" })}>Elegant dark</Button>
      <Button onClick={() => setTheme("elegant", { mode: "system" })}>Elegant system</Button>
    </div>
  );
}`,
  themeState: `import { useTheme } from "raft-ui";

export function ThemeStatus() {
  const { theme, mode, resolvedMode } = useTheme();

  return (
    <p>
      {theme} / {mode} / resolved {resolvedMode}
    </p>
  );
}`,
  themeDataTheme: `<section
  className={cn(
    "rounded-lg border border-line bg-layer-panel p-4 text-foreground shadow-sm",
    "[[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black",
    "[[data-theme=elegant]_&]:shadow-md",
    "[[data-theme=elegant].dark_&]:bg-layer-popover",
  )}
>
  Billing
</section>`,
  manualSource: `@import "tailwindcss";
@source "../node_modules/raft-ui/src";`,
} as const;

export const Route = createFileRoute("/installation")({
  component: InstallationDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CodeSnippet({
  path,
  source,
  html,
}: {
  path: string;
  source: string;
  html: AnyRenderableServerComponent;
}) {
  return <DocsCodeBlock.Panel path={path} source={source} html={html} collapsible={false} />;
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-sm leading-relaxed text-foreground-muted">{children}</p>;
}

function StepList({ children }: { children: ReactNode }) {
  return <ol className="space-y-5 text-sm leading-relaxed text-foreground-muted">{children}</ol>;
}

function InstallationDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Installation"
      description="Install the package, load the stylesheet, and wire the app shell."
      toc={TOC}
      headerAction={<InstallationCopyPrompt prompt={INSTALLATION_PROMPT} />}
    >
      <DocSection id="install" title="Install">
        <div className="space-y-4">
          <Lead>Add the package. React and React DOM come from your app.</Lead>
          <CodeSnippet path="Shell" source={SNIPPETS.install} html={code.install} />
        </div>
      </DocSection>

      <DocSection id="app-shell" title="App shell">
        <div className="space-y-6">
          <Lead>Set up styles and providers once near the root.</Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">
                Import the stylesheet.
              </span>
              <p>
                Load <InlineCode>raft-ui/styles.css</InlineCode> once from your global stylesheet or
                root entry.
              </p>
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">Wrap the app.</span>
              <p>
                <InlineCode>ThemeProvider</InlineCode> syncs theme attributes to the document root.
                Add <InlineCode>TooltipProvider</InlineCode> when the app uses Tooltip.
              </p>
              <CodeSnippet path="src/App.tsx" source={SNIPPETS.appShell} html={code.appShell} />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">
                Keep default portals.
              </span>
              <p>
                Floating components portal to the document body. Pass portal props only for iframes,
                preview frames, or embedded shells.
              </p>
            </li>
          </StepList>

          <p className="border-l-2 border-line-subtle pl-4 text-sm leading-relaxed text-foreground-muted">
            Use <InlineCode>syncDom={"{false}"}</InlineCode> only for nested previews or component
            islands that should not mutate the app root.
          </p>
        </div>
      </DocSection>

      <DocSection id="tailwind" title="Tailwind">
        <div className="space-y-6">
          <Lead>If your app already uses Tailwind v4, skip this section.</Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">Install Tailwind v4.</span>
              <CodeSnippet
                path="Shell"
                source={SNIPPETS.installTailwind}
                html={code.installTailwind}
              />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">
                Register the Vite plugin.
              </span>
              <CodeSnippet path="vite.config.ts" source={SNIPPETS.vite} html={code.vite} />
            </li>
          </StepList>

          <div className="space-y-3 border-l-2 border-line-subtle pl-4">
            <p className="text-sm leading-relaxed text-foreground-muted">
              <InlineCode>raft-ui/styles.css</InlineCode> already includes the package source hint.
            </p>
            <p className="text-sm leading-relaxed text-foreground-muted">
              Add this only if you build your own Tailwind entry and skip the package stylesheet.
            </p>
            <CodeSnippet
              path="src/styles.css"
              source={SNIPPETS.manualSource}
              html={code.manualSource}
            />
          </div>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-4">
          <Lead>Import components from the package.</Lead>
          <CodeSnippet path="src/App.tsx" source={SNIPPETS.app} html={code.app} />
        </div>
      </DocSection>

      <DocSection id="theme" title="Theme">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-medium text-foreground-strong">
              Switch themes
            </h3>
            <Lead>
              Use <InlineCode>setTheme</InlineCode>. Pass a mode only for elegant light, dark, or
              system.
            </Lead>
            <CodeSnippet
              path="src/ThemeSwitcher.tsx"
              source={SNIPPETS.themeSwitching}
              html={code.themeSwitching}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-medium text-foreground-strong">
              Read theme state
            </h3>
            <Lead>
              Read the active family, selected mode, and resolved mode from{" "}
              <InlineCode>useTheme</InlineCode>.
            </Lead>
            <CodeSnippet
              path="src/ThemeStatus.tsx"
              source={SNIPPETS.themeState}
              html={code.themeState}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-medium text-foreground-strong">
              Customize with data-theme
            </h3>
            <Lead>
              Prefer semantic tokens. Use <InlineCode>data-theme</InlineCode> variants only for
              family-specific differences.
            </Lead>
            <CodeSnippet
              path="src/BillingCard.tsx"
              source={SNIPPETS.themeDataTheme}
              html={code.themeDataTheme}
            />
          </div>
        </div>
      </DocSection>

      <DocSection id="requirements" title="Requirements">
        <ul className="space-y-3 text-sm leading-relaxed text-foreground-muted">
          <li>
            <span className="font-medium text-foreground-strong">React:</span> RUI expects React 19
            and React DOM 19.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">CSS:</span> import{" "}
            <InlineCode>raft-ui/styles.css</InlineCode> once.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Build:</span> use a Tailwind
            v4-capable build pipeline.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Nested themes:</span> pass{" "}
            <InlineCode>syncDom={"{false}"}</InlineCode> for previews that should not update the
            document root.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Tooltips:</span> use one{" "}
            <InlineCode>TooltipProvider</InlineCode> near the app root.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Portals:</span> use custom portal
            containers only for iframes, previews, or embedded shells.
          </li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
