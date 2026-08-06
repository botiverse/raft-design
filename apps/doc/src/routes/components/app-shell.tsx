import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { AppShellCollapsibleSidebarComposition } from "#/modules/app-shell/compositions/collapsible-sidebar.composition.tsx";
import { AppShellPreview } from "#/modules/app-shell/app-shell.preview.tsx";
import appShellCollapsibleSidebarCompositionSource from "#/modules/app-shell/compositions/collapsible-sidebar.composition.tsx?raw";
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
] as const;

const SNIPPETS = {
  collapsibleSidebarComposition: appShellCollapsibleSidebarCompositionSource,
  responsiveComposition: appShellResponsiveCompositionSource,
  anatomy: `import {
  AppShellMainSlot,
  AppShellOverlaySlot,
  AppShellPanelSlot,
  AppShellRailSlot,
  AppShellRoot,
  AppShellSidebarSlot,
} from "raft-ui";

<AppShellRoot>
  <AppShellRailSlot>...</AppShellRailSlot>
  <AppShellSidebarSlot>...</AppShellSidebarSlot>
  <AppShellMainSlot contentEdge="attached" overlay>
    ...
    <AppShellOverlaySlot>...</AppShellOverlaySlot>
  </AppShellMainSlot>
  <AppShellPanelSlot>...</AppShellPanelSlot>
</AppShellRoot>`,
} as const;

const APP_SHELL_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "sidebarCollapsible",
    type: "boolean",
    default: "false",
    description:
      "When true, coordinates sidebar visibility and measures sidebar width for the main-panel transition.",
  },
  {
    name: "sidebarOpen / defaultSidebarOpen",
    type: "boolean",
    default: "defaultSidebarOpen: true",
    description:
      "Controlled or uncontrolled sidebar visibility when sidebarCollapsible is enabled.",
  },
  {
    name: "onSidebarOpenChange",
    type: "(open: boolean) => void",
    description: "Called when a collapsible sidebar opens or closes.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Owns the responsive row-to-column layout and top safe-area inset.",
  },
];

const APP_SHELL_RAIL_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Desktop rail column by default. Mount a separate instance with className for mobile bottom navigation; visibility stays caller-owned.",
  },
];

const APP_SHELL_SIDEBAR_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Desktop sidebar column by default. When the root is collapsible, its measured width drives the main-panel transition. Override with className when the caller mounts it below md.",
  },
];

const APP_SHELL_MAIN_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "contentEdge",
    type: '"inset" | "attached"',
    default: '"inset"',
    description:
      "Controls how primary content meets the preceding region. Attached owns the structural divider and removes the Elegant ConversationPanel inset at the shared edge.",
  },
  {
    name: "overlay",
    type: "boolean",
    default: "false",
    description:
      "Provides the positioning context for an AppShellOverlaySlot rendered inside the main region.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"main">',
    description:
      "Flexible primary content region. In a collapsible desktop layout, mount it inside a relative main panel so it can expand over the sidebar.",
  },
];

const APP_SHELL_OVERLAY_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Theme-aware overlay region for temporarily covering the primary content without changing the column layout.",
  },
];

const APP_SHELL_PANEL_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Optional secondary column. Place it in a caller-owned ResizablePanel when the user can adjust the split; the caller owns its width and surface.",
  },
];

const APP_SHELL_SIDEBAR_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
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
      description="Layout-only foundations for rail, sidebar, main content, and optional panels."
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
              <InlineCode>AppShell</InlineCode> hides the rail and sidebar and switches to a column
              below <InlineCode>md</InlineCode>. Keep the active page in{" "}
              <InlineCode>AppShellMainSlot</InlineCode> and add mobile navigation with{" "}
              <InlineCode>md:hidden</InlineCode>.
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
              Set <InlineCode>sidebarCollapsible</InlineCode> on the root and render{" "}
              <InlineCode>AppShellSidebarTrigger</InlineCode> in the main panel. The sidebar remains
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
                collapsedHtml={code.collapsibleSidebarCompositionBody}
                showLineNumbers={false}
              />
            </div>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-app-shell-root" title="AppShellRoot">
            <PropsTable rows={APP_SHELL_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-app-shell-rail-slot" title="AppShellRailSlot">
            <PropsTable rows={APP_SHELL_RAIL_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-app-shell-sidebar-slot" title="AppShellSidebarSlot">
            <PropsTable rows={APP_SHELL_SIDEBAR_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-app-shell-main-slot" title="AppShellMainSlot">
            <PropsTable rows={APP_SHELL_MAIN_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-app-shell-overlay-slot" title="AppShellOverlaySlot">
            <PropsTable rows={APP_SHELL_OVERLAY_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-app-shell-panel-slot" title="AppShellPanelSlot">
            <PropsTable rows={APP_SHELL_PANEL_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-app-shell-sidebar-trigger"
            title="AppShellSidebarTrigger"
          >
            <PropsTable rows={APP_SHELL_SIDEBAR_TRIGGER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
