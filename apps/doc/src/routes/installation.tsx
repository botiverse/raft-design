import { InlineCode, Tabs, TabsBackground, TabsLabel, TabsList, TabsPanel, TabsTab } from "raft-ui";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { InstallationCopyPrompt } from "#/components/installation-copy-prompt.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "install", title: "Install" },
  { id: "app-shell", title: "App shell" },
  { id: "toast", title: "Toast" },
  { id: "tailwind", title: "Tailwind" },
  { id: "usage", title: "Usage" },
  { id: "theme", title: "Theme" },
  { id: "requirements", title: "Requirements" },
] as const;

const INSTALLATION_PROMPT = `Install and initialize raft-ui in this repository.

1. Inspect the repository and use its existing package manager. Do not change package managers or lockfile format.
   - Single-package repository: install the latest stable raft-ui as a dependency and skills-npm as a dev dependency in that package.
   - Monorepo: install raft-ui in the target app workspace, then install skills-npm as a dev dependency at the workspace root.
2. Run the installed skills-npm setup command where skills-npm was installed. For a monorepo, run it at the workspace root with --recursive. Let setup detect the active coding agent, add its prepare hook and gitignore entry, and perform the first sync.
3. Do not copy the skill manually. Confirm that skills-npm discovered node_modules/raft-ui/skills/guide and created the npm-raft-ui-guide symlink for the active agent. For Codex, this should resolve under .agents/skills/npm-raft-ui-guide.
4. Read the installed raft-ui skill's SKILL.md completely. Read rules/setup.md now, then load only the other rule files relevant to the UI being built. If the agent cannot discover local skills, read node_modules/raft-ui/skills/guide/SKILL.md directly and follow it for this task.
5. Follow the skill to initialize raft-ui: wire Tailwind CSS v4, import raft-ui/styles.css once, decide whether to load raft-ui/fonts.css separately, add ThemeProvider, and add TooltipProvider or ToastProvider only when the app needs them.
6. Put the application inside an isolated layout root so body portals stack above app content. Keep default body portals unless this is an iframe, preview, or embedded shell.
7. Before writing raft-ui UI, explicitly invoke $raft-ui-skill when the agent supports skill mentions. Inspect node_modules/raft-ui/dist/index.d.mts before using any prop, part, or variant you have not verified. Do not guess APIs or import from raft-ui/wip unless asked.
8. Validate the changed files with the repository's existing checks.

When finished, summarize the files changed, the installed skill path, the providers added, and the validation results.`;

const SNIPPETS = {
  install: `pnpm add raft-ui
pnpm add -D skills-npm
pnpm exec skills-npm setup`,
  installMonorepo: `pnpm --filter your-app add raft-ui
pnpm add -Dw skills-npm
pnpm exec skills-npm setup --recursive`,
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
  layoutRoot: `<body>
  <div className="isolate">
    {children}
  </div>
</body>`,
  portalRootCss: `.root {
  isolation: isolate;
}`,
  globalCss: `@source "../node_modules/raft-ui/dist/**/*.{js,mjs}";
@import "raft-ui/styles.css";
@import "tailwindcss";`,
  fontCss: `import "raft-ui/fonts.css";
import "./styles.css";`,
  appShell: `import { ThemeProvider, ToastProvider, TooltipProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TooltipProvider>
          <YourApp />
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}`,
  toastProvider: `import { ThemeProvider, ToastProvider, TooltipProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider timeout={3600} limit={3}>
        <TooltipProvider>
          <YourApp />
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}`,
  toastUsage: `import { Button, toast } from "raft-ui";

export function CopyLinkButton() {
  return (
    <Button
      onClick={() => {
        toast.success("Link copied.", {
          description: "Ready to paste into the thread.",
          action: {
            label: "Undo",
            onClick: () => toast.dismiss(),
          },
        });
      }}
    >
      Copy link
    </Button>
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
    "rounded-lg border border-line bg-layer-panel p-4 text-foreground-strong shadow-raft-sm",
    "[[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black",
    "[[data-theme=elegant]_&]:shadow-raft-md",
    "[[data-theme=elegant].dark_&]:bg-layer-popover",
  )}
>
  Billing
</section>`,
  manualSource: `@source "../../node_modules/raft-ui/dist/**/*.{js,mjs}";`,
} as const;

export const Route = createFileRoute("/installation")({
  component: InstallationDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CodeSnippet({ path, source, html }: { path: string; source: string; html: string }) {
  return <DocsCodeBlock.Panel path={path} source={source} html={html} collapsible={false} />;
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-sm leading-7 text-foreground-muted">{children}</p>;
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
    >
      <DocSection id="install" title="Install">
        <Tabs defaultValue="ai">
          <TabsList aria-label="Installation method">
            <TabsBackground />
            <TabsTab value="ai">
              <Bot aria-hidden />
              <TabsLabel>For AI</TabsLabel>
            </TabsTab>
            <TabsTab value="human">
              <UserRound aria-hidden />
              <TabsLabel>For human</TabsLabel>
            </TabsTab>
          </TabsList>
          <TabsPanel value="ai" className="pt-4">
            <div className="space-y-4">
              <Lead>
                Copy this prompt into Codex or another coding agent. It installs the package,
                initializes the bundled skill, and uses that skill to configure your app.
              </Lead>
              <InstallationCopyPrompt prompt={INSTALLATION_PROMPT} />
            </div>
          </TabsPanel>
          <TabsPanel value="human" className="pt-4">
            <div className="space-y-6">
              <Lead>
                Add the package and initialize its bundled skill. The setup command detects your
                coding agents and keeps their skill symlinks in sync after installs.
              </Lead>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Single-package app</h3>
                <CodeSnippet path="Shell" source={SNIPPETS.install} html={code.install} />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">pnpm workspace</h3>
                <Lead>
                  Replace <InlineCode>your-app</InlineCode> with the target workspace package name.
                </Lead>
                <CodeSnippet
                  path="Shell"
                  source={SNIPPETS.installMonorepo}
                  html={code.installMonorepo}
                />
              </div>
            </div>
          </TabsPanel>
        </Tabs>
      </DocSection>

      <DocSection id="app-shell" title="App shell">
        <div className="space-y-6">
          <Lead>Set up styles and providers once near the root.</Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Import the stylesheet.</span>
              <p>
                Load the package source hint, <InlineCode>raft-ui/styles.css</InlineCode>, and
                Tailwind once from your global stylesheet.
              </p>
              <CodeSnippet
                path="src/styles.css"
                source={SNIPPETS.globalCss}
                html={code.globalCss}
              />
              <p>
                Font loading and default family assignments are intentionally separate from{" "}
                <InlineCode>raft-ui/styles.css</InlineCode>. Load{" "}
                <InlineCode>raft-ui/fonts.css</InlineCode> as its own stylesheet if you want the
                package default font setup. Do not nest it inside your main CSS file; it contains a
                font <InlineCode>@import</InlineCode>. If you prefer self-hosted fonts, skip this
                file and assign your own <InlineCode>--heading-font</InlineCode>,{" "}
                <InlineCode>--sans-font</InlineCode>, and <InlineCode>--mono-font</InlineCode>{" "}
                values.
              </p>
              <CodeSnippet path="src/main.tsx" source={SNIPPETS.fontCss} html={code.fontCss} />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Wrap the app.</span>
              <p>
                <InlineCode>ThemeProvider</InlineCode> syncs theme attributes to the document root.
                Add <InlineCode>TooltipProvider</InlineCode> when the app uses Tooltip. Add{" "}
                <InlineCode>ToastProvider</InlineCode> once when the app uses toast feedback.
              </p>
              <p>
                Dark mode is class-driven: the provider resolves the system preference and stamps
                the <InlineCode>.light</InlineCode> or <InlineCode>.dark</InlineCode> class on the
                root. Server-rendered apps that persist a mode should replay it with a small inline
                script before first paint (the next-themes pattern) so system-dark visitors do not
                flash light.
              </p>
              <CodeSnippet path="src/App.tsx" source={SNIPPETS.appShell} html={code.appShell} />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Isolate the layout root.</span>
              <p>
                Base UI portals render floating surfaces such as Dialog, Popover, Select,
                DropdownMenu, and Tooltip at the document body. Add Tailwind's{" "}
                <InlineCode>isolate</InlineCode> class to the application root so portaled surfaces
                stack above page content instead of competing with app-level{" "}
                <InlineCode>z-index</InlineCode> values. Keep the default body portal behavior
                unless the app renders inside an iframe, preview frame, or embedded shell.
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                <CodeSnippet
                  path="layout.tsx"
                  source={SNIPPETS.layoutRoot}
                  html={code.layoutRoot}
                />
                <CodeSnippet
                  path="styles.css"
                  source={SNIPPETS.portalRootCss}
                  html={code.portalRootCss}
                />
              </div>
              <p>
                If the host layout does not use Tailwind, apply the same CSS with{" "}
                <InlineCode>isolation: isolate</InlineCode>.
              </p>
            </li>
          </StepList>
        </div>
      </DocSection>

      <DocSection id="toast" title="Toast">
        <div className="space-y-6">
          <Lead>
            Add <InlineCode>ToastProvider</InlineCode> near the app root, then call{" "}
            <InlineCode>toast.info</InlineCode>, <InlineCode>toast.success</InlineCode>,{" "}
            <InlineCode>toast.warning</InlineCode>, or <InlineCode>toast.error</InlineCode> from
            event handlers.
          </Lead>

          <div className="grid gap-3 lg:grid-cols-2">
            <CodeSnippet
              path="src/App.tsx"
              source={SNIPPETS.toastProvider}
              html={code.toastProvider}
            />
            <CodeSnippet
              path="src/CopyLinkButton.tsx"
              source={SNIPPETS.toastUsage}
              html={code.toastUsage}
            />
          </div>
        </div>
      </DocSection>

      <DocSection id="tailwind" title="Tailwind">
        <div className="space-y-6">
          <Lead>If your app already uses Tailwind v4, skip this section.</Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Install Tailwind v4.</span>
              <CodeSnippet
                path="Shell"
                source={SNIPPETS.installTailwind}
                html={code.installTailwind}
              />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Register the Vite plugin.</span>
              <CodeSnippet path="vite.config.ts" source={SNIPPETS.vite} html={code.vite} />
            </li>
          </StepList>

          <div className="space-y-3 border-l-2 border-line-muted pl-4">
            <p className="text-sm leading-relaxed text-foreground-muted">
              <InlineCode>@source</InlineCode> is relative to this CSS file.
            </p>
            <p className="text-sm leading-relaxed text-foreground-muted">
              Adjust the path when your global stylesheet lives deeper in the app.
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
            <h3 className="font-heading text-lg font-medium text-foreground">Switch themes</h3>
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
            <h3 className="font-heading text-lg font-medium text-foreground">Read theme state</h3>
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
            <h3 className="font-heading text-lg font-medium text-foreground">
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
            <span className="font-medium text-foreground">React:</span> RUI expects React 19 and
            React DOM 19.
          </li>
          <li>
            <span className="font-medium text-foreground">CSS:</span> import{" "}
            <InlineCode>raft-ui/styles.css</InlineCode> once.
          </li>
          <li>
            <span className="font-medium text-foreground">Fonts:</span>{" "}
            <InlineCode>raft-ui/fonts.css</InlineCode> is optional. It loads the package default
            fonts and assigns the default font-family tokens. Use it, replace it, or self-host the
            font families your app wants.
          </li>
          <li>
            <span className="font-medium text-foreground">Build:</span> use a Tailwind v4-capable
            build pipeline.
          </li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
