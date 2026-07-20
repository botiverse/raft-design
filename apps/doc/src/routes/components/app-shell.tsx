import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { AppShellCollapsibleSidebarComposition } from "#/modules/app-shell/compositions/collapsible-sidebar.composition.tsx";
import { AppShellDesktopComposition } from "#/modules/app-shell/compositions/desktop.composition.tsx";
import { AppShellPreview } from "#/modules/app-shell/app-shell.preview.tsx";
import { SourceAppShellPreview } from "#/modules/app-shell/app-shell.source-preview.tsx";
import appShellCollapsibleSidebarCompositionSource from "#/modules/app-shell/compositions/collapsible-sidebar.composition.tsx?raw";
import appShellDesktopCompositionSource from "#/modules/app-shell/compositions/desktop.composition.tsx?raw";
import appShellResponsiveCompositionSource from "#/modules/app-shell/compositions/responsive.composition.tsx?raw";

const APP_SHELL_RESPONSIVE_COMPOSITION_PATH =
  "apps/doc/src/modules/app-shell/compositions/responsive.composition.tsx";
const APP_SHELL_COLLAPSIBLE_SIDEBAR_COMPOSITION_PATH =
  "apps/doc/src/modules/app-shell/compositions/collapsible-sidebar.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
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
  collapsibleSidebarComposition: appShellCollapsibleSidebarCompositionSource,
  desktopComposition: appShellDesktopCompositionSource,
  responsiveComposition: appShellResponsiveCompositionSource,
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
      "Owns the responsive row-to-column layout and top safe-area inset. Set sidebarCollapsible to coordinate sidebar visibility; use defaultSidebarOpen for uncontrolled state or sidebarOpen and onSidebarOpenChange for controlled state.",
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
      "Desktop sidebar column by default. When the root is collapsible, its measured width drives the main-panel transition. Override with className when the caller mounts it below md.",
  },
  {
    name: "AppShellMainSlot",
    type: 'useRender.ComponentProps<"main">',
    description:
      "Flexible primary content region. In a collapsible desktop layout, mount it inside a relative main panel so it can expand over the sidebar.",
  },
  {
    name: "AppShellSidebarTrigger",
    type: "PanelAction props",
    description:
      "Toggles a collapsible root and returns null otherwise. Provide the caller-owned icon as children; it supplies accessible collapse and expand labels.",
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
        <AppShellPreview
          code={code.collapsibleSidebarComposition}
          collapsedCode={code.collapsibleSidebarCompositionBody}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="responsive" title="Responsive">
            <p>
              AppShell hides the rail and sidebar and switches to a column below md. Keep the active
              page in AppShellMainSlot and add mobile navigation with md:hidden.
            </p>
            <DocsCodeBlock.Panel
              path={APP_SHELL_RESPONSIVE_COMPOSITION_PATH}
              source={appShellResponsiveCompositionSource}
              html={code.responsiveComposition}
              collapsedHtml={code.responsiveCompositionBody}
              showLineNumbers={false}
            />
          </DocSubsection>

          <DocSubsection parentId="usage" id="collapsible-sidebar" title="Collapsible sidebar">
            <p>
              Set <code>sidebarCollapsible</code> on the root and render{" "}
              <code>AppShellSidebarTrigger</code> in the main panel. The sidebar remains
              caller-owned; the shell only measures its width and coordinates the collapse
              transition. For a resizable desktop shell, keep the sidebar and main slots in sibling
              relative panels as shown below.
            </p>
            <div className="mt-4">
              <AppShellCollapsibleSidebarComposition />
            </div>
            <div className="mt-4">
              <DocsCodeBlock.Panel
                path={APP_SHELL_COLLAPSIBLE_SIDEBAR_COMPOSITION_PATH}
                source={appShellCollapsibleSidebarCompositionSource}
                html={code.collapsibleSidebarComposition}
                showLineNumbers={false}
              />
            </div>
          </DocSubsection>
        </div>
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
              compositionCode: code.desktopComposition,
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
