import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { AppShellDesktopComposition } from "#/modules/app-shell/compositions/desktop.composition.tsx";
import { AppShellPreview } from "#/modules/app-shell/app-shell.preview.tsx";
import { SourceAppShellPreview } from "#/modules/app-shell/app-shell.source-preview.tsx";
import appShellDesktopCompositionSource from "#/modules/app-shell/compositions/desktop.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock desktop shell",
    scenes: [
      {
        label: "MainLayout.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/layout/MainLayout.tsx",
      },
      {
        label: "LeftRail.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/layout/LeftRail.tsx",
      },
      {
        label: "Sidebar.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/layout/Sidebar.tsx",
      },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `<AppShellRoot>
  <AppShellRailSlot>...</AppShellRailSlot>
  <AppShellSidebarSlot>...</AppShellSidebarSlot>
  <AppShellMainSlot>...</AppShellMainSlot>
</AppShellRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AppShellRoot",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Owns the responsive row-to-column layout and top safe-area inset. Mobile safe-area surface color stays caller-owned via className.",
  },
  {
    name: "AppShellRailSlot",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Desktop rail column by default. Mount a separate instance with className for mobile bottom navigation; visibility stays caller-owned.",
  },
  {
    name: "AppShellSidebarSlot",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Desktop sidebar column by default. Override with className when the caller mounts it below md.",
  },
  {
    name: "AppShellMainSlot",
    type: 'useRender.ComponentProps<"main">',
    description: "Flexible primary content region.",
  },
];

export const Route = createFileRoute("/components/app-shell")({
  component: AppShellDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AppShellDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AppShell"
      description="Layout-only foundations for rail, sidebar, and main content."
      toc={TOC}
      articleClassName="max-w-none"
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <AppShellPreview />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Desktop shell regions",
              status: "review",
              note: "The source fixture preserves the rail, sidebar, and main-region ordering; application state and route wiring remain outside the layout primitive.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="h-[420px] w-full">
                  <SourceAppShellPreview />
                </SourceThemeScope>
              ),
              brutal: <AppShellDesktopComposition />,
              elegant: <AppShellDesktopComposition />,
              elegantDark: <AppShellDesktopComposition />,
              compositionCode: appShellDesktopCompositionSource,
              compositionPath:
                "apps/doc/src/modules/app-shell/compositions/desktop.composition.tsx",
              compositionSource: appShellDesktopCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
