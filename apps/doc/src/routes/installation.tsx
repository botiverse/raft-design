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
  { id: "tailwind", title: "Tailwind" },
  { id: "usage", title: "Usage" },
  { id: "theme", title: "Theme" },
  { id: "requirements", title: "Requirements" },
] as const;

const INSTALLATION_PROMPT = `Install raft-ui in this project as an npm package.

Use the package route, not the shadcn registry route.

Requirements:
- Install raft-ui.
- Use Tailwind CSS v4 in the host app.
- Import raft-ui/styles.css exactly once from the app's global stylesheet or root entry.
- Do not import tailwindcss again from the same CSS entry after importing raft-ui/styles.css.
- The package stylesheet already sources raft-ui's component classes.
- Wrap the app in ThemeProvider with syncDom when selecting a style family or color mode.
- Use useTheme().setTheme to switch families and pass mode for elegant light, dark, or system.

Minimal setup:
import "raft-ui/styles.css";
import { ThemeProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider defaultTheme="brutal" defaultMode="light" storageKey="raft-ui-theme" syncDom>
      <YourApp />
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
  globalCss: `@import "raft-ui/styles.css";`,
  app: `import { Button } from "raft-ui";

export function App() {
  return <Button>Save</Button>;
}`,
  themeProvider: `import "raft-ui/styles.css";

import { ThemeProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider defaultTheme="brutal" defaultMode="light" storageKey="raft-ui-theme" syncDom>
      <YourApp />
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
      description="Install raft-ui as a package and wire its Tailwind v4 theme into your app."
      toc={TOC}
      headerAction={<InstallationCopyPrompt prompt={INSTALLATION_PROMPT} />}
    >
      <DocSection id="install" title="Install">
        <div className="space-y-4">
          <Lead>
            Add the package to your app. React and React DOM are peer dependencies, so keep them in
            the host project.
          </Lead>
          <CodeSnippet path="Shell" source={SNIPPETS.install} html={code.install} />
        </div>
      </DocSection>

      <DocSection id="tailwind" title="Tailwind">
        <div className="space-y-6">
          <Lead>
            RUI ships a Tailwind v4 entry stylesheet. Import it once so the semantic tokens,
            component utilities, and package source hints are available to the host build.
          </Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">
                Install Tailwind v4 if your app does not already use it.
              </span>
              <CodeSnippet
                path="Shell"
                source={SNIPPETS.installTailwind}
                html={code.installTailwind}
              />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">
                Register the Tailwind Vite plugin.
              </span>
              <CodeSnippet path="vite.config.ts" source={SNIPPETS.vite} html={code.vite} />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground-strong">
                Import the RUI stylesheet once.
              </span>
              <CodeSnippet
                path="src/styles.css"
                source={SNIPPETS.globalCss}
                html={code.globalCss}
              />
            </li>
          </StepList>

          <div className="space-y-3 border-l-2 border-line-subtle pl-4">
            <p className="text-sm leading-relaxed text-foreground-muted">
              You normally do not need to manually include the npm package in Tailwind content
              detection. The RUI stylesheet imports Tailwind and includes a package-local source
              hint for its component classes.
            </p>
            <p className="text-sm leading-relaxed text-foreground-muted">
              Add a manual source only if you skip <InlineCode>raft-ui/styles.css</InlineCode> and
              build your Tailwind entry yourself.
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
          <Lead>
            Import components from the package after the stylesheet is present in your app shell.
          </Lead>
          <CodeSnippet path="src/App.tsx" source={SNIPPETS.app} html={code.app} />
        </div>
      </DocSection>

      <DocSection id="theme" title="Theme">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-medium text-foreground-strong">
              Connect the provider
            </h3>
            <Lead>
              Wrap the app once. Use <InlineCode>syncDom</InlineCode> when this provider owns the
              app-level theme so RUI can keep <InlineCode>data-theme</InlineCode> and color mode
              classes on the document root in sync.
            </Lead>
            <CodeSnippet
              path="src/App.tsx"
              source={SNIPPETS.themeProvider}
              html={code.themeProvider}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-medium text-foreground-strong">
              Switch themes
            </h3>
            <Lead>
              Use <InlineCode>setTheme</InlineCode> from <InlineCode>useTheme</InlineCode>. Pass the
              family first, then add a mode when selecting an elegant color mode.
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
              Read the selected family, selected mode, and resolved mode when labels, previews, or
              app logic need to reflect the active theme.
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
              Use Tailwind classes against semantic tokens first, then add{" "}
              <InlineCode>data-theme</InlineCode> variants only for the details that should differ
              between theme families.
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
            and React DOM 19 from the host app.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">CSS:</span> import{" "}
            <InlineCode>raft-ui/styles.css</InlineCode> once. Do not also import{" "}
            <InlineCode>tailwindcss</InlineCode> separately from the same entry.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Build:</span> the host app needs a
            Tailwind v4-capable build pipeline.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Theme switching:</span> use{" "}
            <InlineCode>syncDom</InlineCode> on the app-level provider. Nested preview providers can
            omit it.
          </li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
