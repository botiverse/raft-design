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

const INSTALLATION_PROMPT = `Install @raft/ui in this project as an npm package.

Use the package route, not the shadcn registry route.

Requirements:
- Install @raft/ui.
- Use Tailwind CSS v4 in the host app.
- Import @raft/ui/styles.css exactly once from the app's global stylesheet or root entry.
- Do not import tailwindcss again from the same CSS entry after importing @raft/ui/styles.css.
- The package stylesheet already sources @raft/ui's component classes.
- Wrap the app in ThemeProvider with syncDom when selecting a style family or color mode.
- Use useTheme to switch to brutal, elegant light, elegant dark, or elegant system.

Example:
import "@raft/ui/styles.css";
import { Button, ThemeProvider, useTheme } from "@raft/ui";

function ThemeControls() {
  const { setBrutal, setElegantLight, setElegantDark, setElegantSystem } = useTheme();

  return (
    <div>
      <Button onClick={setBrutal}>Brutal</Button>
      <Button onClick={setElegantLight}>Elegant light</Button>
      <Button onClick={setElegantDark}>Elegant dark</Button>
      <Button onClick={setElegantSystem}>Elegant system</Button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="brutal" defaultMode="light" storageKey="raft-ui-theme" syncDom>
      <ThemeControls />
    </ThemeProvider>
  );
}`;

const SNIPPETS = {
  install: "pnpm add @raft/ui",
  installTailwind: "pnpm add -D tailwindcss @tailwindcss/vite",
  vite: `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});`,
  globalCss: `@import "@raft/ui/styles.css";`,
  app: `import { Button } from "@raft/ui";

export function App() {
  return <Button>Save</Button>;
}`,
  themeProvider: `import "@raft/ui/styles.css";

import { Button, ThemeProvider, useTheme } from "@raft/ui";

function ThemeControls() {
  const {
    theme,
    mode,
    resolvedMode,
    setBrutal,
    setElegantLight,
    setElegantDark,
    setElegantSystem,
  } = useTheme();

  return (
    <div>
      <p>
        {theme} / {mode} / resolved {resolvedMode}
      </p>
      <Button onClick={setBrutal}>Brutal</Button>
      <Button onClick={setElegantLight}>Elegant light</Button>
      <Button onClick={setElegantDark}>Elegant dark</Button>
      <Button onClick={setElegantSystem}>Elegant system</Button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="brutal" defaultMode="light" storageKey="raft-ui-theme" syncDom>
      <ThemeControls />
    </ThemeProvider>
  );
}`,
  manualSource: `@import "tailwindcss";
@source "../node_modules/@raft/ui/src";`,
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
      description="Install @raft/ui as a package and wire its Tailwind v4 theme into your app."
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
              Add a manual source only if you skip
              <code className="mx-1 font-mono text-foreground-strong">@raft/ui/styles.css</code>
              and build your Tailwind entry yourself.
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
        <div className="space-y-4">
          <Lead>
            ThemeProvider supplies the style family to component recipes. Add
            <code className="mx-1 font-mono text-foreground-strong">syncDom</code>
            at the application root so RUI also updates
            <code className="mx-1 font-mono text-foreground-strong">data-theme</code>
            and the light/dark class on
            <code className="mx-1 font-mono text-foreground-strong">document.documentElement</code>.
          </Lead>
          <CodeSnippet
            path="src/App.tsx"
            source={SNIPPETS.themeProvider}
            html={code.themeProvider}
          />
        </div>
      </DocSection>

      <DocSection id="requirements" title="Requirements">
        <ul className="space-y-3 text-sm leading-relaxed text-foreground-muted">
          <li>
            <span className="font-medium text-foreground-strong">React:</span> RUI expects React 19
            and React DOM 19 from the host app.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">CSS:</span> import
            <code className="mx-1 font-mono text-foreground-strong">@raft/ui/styles.css</code>
            once. Do not also import
            <code className="mx-1 font-mono text-foreground-strong">tailwindcss</code>
            separately from the same entry.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Build:</span> the host app needs a
            Tailwind v4-capable build pipeline.
          </li>
          <li>
            <span className="font-medium text-foreground-strong">Theme switching:</span> use
            <code className="mx-1 font-mono text-foreground-strong">syncDom</code>
            on the app-level provider. Nested preview providers can omit it.
          </li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
