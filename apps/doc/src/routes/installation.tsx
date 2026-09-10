import { InlineCode } from "raft-ui";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "install", title: "Install" },
  { id: "import-styles", title: "Import styles" },
  { id: "app-shell", title: "App shell" },
  { id: "usage", title: "Usage" },
  { id: "theme", title: "Theme" },
  { id: "toast", title: "Toast" },
  { id: "agent-skills", title: "Optional agent skills" },
] as const;

const INSTALLATION_PROMPT = `Help me use rUI in this project.

rUI is a UI system with expressive visuals and playful interactions, shaped by Raft and made for whatever we build next. Its React package, raft-ui, includes components and compound parts, Brutal and Elegant themes, design tokens, typography, and interaction behavior. Use it to build a product with rUI's style while keeping product data, permissions, and workflows in the app.

Start with https://rui.botiverse.build/guides/overview to understand the system and choose a path for the task. Inspect this repository's framework, package manager, existing UI, and installed raft-ui version before making changes.

Read only the relevant guides:
- New app or first integration: https://rui.botiverse.build/guides/setup
- Existing app: setup plus https://rui.botiverse.build/guides/styling; scope changes to the requested surface and check global styles, theme ownership, and portals.
- Chat or collaboration: https://rui.botiverse.build/guides/conversation
- Dashboard or workspace: https://rui.botiverse.build/guides/layout, https://rui.botiverse.build/guides/forms, and https://rui.botiverse.build/guides/feedback.
- Custom composition: https://rui.botiverse.build/guides/composition and https://rui.botiverse.build/guides/styling.
- Exact APIs: https://rui.botiverse.build/guides/lookup and the relevant component pages linked from those guides or the component catalog at https://rui.botiverse.build/components.

For a fresh setup, install raft-ui in the target app using the existing package manager, configure its styles and typography, choose a theme, and render a first component. Add providers only when needed. For an existing integration, reuse its setup and implement the requested UI. Preserve rUI's design language through its components and semantic tokens.

Verify APIs against node_modules/raft-ui/dist/index.d.mts rather than guessing. If the website differs from the installed version or is unavailable, read the version-matched Markdown files in node_modules/raft-ui/skills/raft-ui-guide/rules/. No skill loader is required. Skill installation and agent configuration changes are optional; do not make them unless requested. Use raft-ui/wip only when explicitly requested.

Validate with the project's existing checks. Summarize the result, setup or UI changes, and any verification gaps.`;

const SNIPPETS = {
  installationPrompt: INSTALLATION_PROMPT,
  intentConfig: `{
  "intent": {
    "skills": ["raft-ui"]
  }
}`,
  intentInstall: `pnpm dlx @tanstack/intent@latest install --map
pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-guide`,
  intentSkills: `pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-guide
pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-critique`,
  skillsNpm: `pnpm add -D skills-npm
pnpm exec skills-npm setup`,
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
  globalCss: `@import "tailwindcss";
@import "raft-ui/styles.css";
@source "../node_modules/raft-ui/dist/**/*.{js,mjs}";`,
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
      description="Install the package, import the stylesheet, and wire the app shell."
      toc={TOC}
    >
      <DocSection id="install" title="Install">
        <div className="space-y-4">
          <Lead>
            Give this prompt to your coding agent along with the UI you want to build. It introduces
            rUI and points to the guides for your task. No skill installation is required.
          </Lead>
          <CodeSnippet path="Prompt" source={INSTALLATION_PROMPT} html={code.installationPrompt} />
        </div>
      </DocSection>

      <DocSection id="import-styles" title="Import styles">
        <div className="space-y-6">
          <Lead>
            Load the package source hint and <InlineCode>raft-ui/styles.css</InlineCode> once from
            your global stylesheet, in that order before{" "}
            <InlineCode>@import "tailwindcss"</InlineCode>. This step assumes you already have{" "}
            <InlineCode>Tailwind v4</InlineCode> wired into your build.
          </Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Add the global stylesheet.</span>
              <CodeSnippet
                path="src/styles.css"
                source={SNIPPETS.globalCss}
                html={code.globalCss}
              />
              <p>
                <InlineCode>@source</InlineCode> is relative to this CSS file, and{" "}
                <InlineCode>Tailwind v4</InlineCode> does not scan{" "}
                <InlineCode>node_modules</InlineCode> by default. Adjust the path when your global
                stylesheet lives deeper in the app.
              </p>
              <CodeSnippet
                path="src/styles.css"
                source={SNIPPETS.manualSource}
                html={code.manualSource}
              />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Load fonts (optional).</span>
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
          </StepList>
        </div>
      </DocSection>

      <DocSection id="app-shell" title="App shell">
        <div className="space-y-6">
          <Lead>Set up providers once near the root.</Lead>

          <StepList>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Wrap the app.</span>
              <p>
                <InlineCode>ThemeProvider</InlineCode> syncs theme attributes to the document root.
                Add <InlineCode>TooltipProvider</InlineCode> when the app uses{" "}
                <InlineCode>Tooltip</InlineCode>. Add <InlineCode>ToastProvider</InlineCode> once
                when the app uses toast feedback.
              </p>
              <p>
                Dark mode is class-driven: the provider resolves the system preference and stamps
                the <InlineCode>.light</InlineCode> or <InlineCode>.dark</InlineCode> class on the
                root. Server-rendered apps that persist a mode should replay it with a small inline
                script before first paint (the <InlineCode>next-themes</InlineCode> pattern) so
                system-dark visitors do not flash light.
              </p>
              <CodeSnippet path="src/App.tsx" source={SNIPPETS.appShell} html={code.appShell} />
            </li>
            <li className="space-y-3">
              <span className="block font-medium text-foreground">Isolate the layout root.</span>
              <p>
                <InlineCode>Base UI</InlineCode> portals render floating surfaces such as{" "}
                <InlineCode>Dialog</InlineCode>, <InlineCode>Popover</InlineCode>,{" "}
                <InlineCode>Select</InlineCode>, <InlineCode>DropdownMenu</InlineCode>, and{" "}
                <InlineCode>Tooltip</InlineCode> at the document body. Add{" "}
                <InlineCode>Tailwind</InlineCode>&apos;s <InlineCode>isolate</InlineCode> class to
                the application root so portaled surfaces stack above page content instead of
                competing with app-level <InlineCode>z-index</InlineCode> values. Keep the default
                body portal behavior unless the app renders inside an{" "}
                <InlineCode>iframe</InlineCode>, preview frame, or embedded shell.
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
                If the host layout does not use <InlineCode>Tailwind</InlineCode>, apply the same
                CSS with <InlineCode>isolation: isolate</InlineCode>.
              </p>
            </li>
          </StepList>
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
          <Lead>Optional: theme switching, reading, and customization after the core setup.</Lead>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-medium text-foreground">Switch themes</h3>
            <Lead>
              Use <InlineCode>setTheme</InlineCode>. Pass a mode only when the family is{" "}
              <InlineCode>elegant</InlineCode>: <InlineCode>light</InlineCode>,{" "}
              <InlineCode>dark</InlineCode>, or <InlineCode>system</InlineCode>.
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

      <DocSection id="toast" title="Toast">
        <div className="space-y-6">
          <Lead>
            Optional: add <InlineCode>ToastProvider</InlineCode> near the app root, then call{" "}
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

      <DocSection id="agent-skills" title="Optional agent skills">
        <div className="space-y-6">
          <Lead>
            You can read the guides directly without installing skills. For agents with skill
            discovery, raft-ui also ships <InlineCode>raft-ui-guide</InlineCode> for implementation
            and <InlineCode>raft-ui-critique</InlineCode> for interface review. TanStack Intent
            discovers both from the installed package, including dependencies of pnpm workspace
            packages.
          </Lead>
          <CodeSnippet
            path="package.json"
            source={SNIPPETS.intentConfig}
            html={code.intentConfig}
          />
          <CodeSnippet path="Shell" source={SNIPPETS.intentInstall} html={code.intentInstall} />
          <CodeSnippet
            path="Available skills"
            source={SNIPPETS.intentSkills}
            html={code.intentSkills}
          />
          <div className="space-y-3 border-l-2 border-line-muted pl-4">
            <h3 className="text-sm font-medium text-foreground">Using skills-npm</h3>
            <Lead>
              The same package remains compatible with skills-npm and other standard Agent Skill
              installers. skills-npm 1.2.0 has a known limitation when recursively aggregating
              multiple skills from one package in a monorepo, so prefer Intent for that layout or
              run skills-npm non-recursively where raft-ui is a direct dependency.
            </Lead>
            <CodeSnippet path="Shell" source={SNIPPETS.skillsNpm} html={code.skillsNpm} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
