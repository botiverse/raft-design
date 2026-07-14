import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { AppShellPreview } from "#/modules/app-shell/app-shell.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `<AppShellRoot>
  <AppShellRail>...</AppShellRail>
  <AppShellSidebar>...</AppShellSidebar>
  <AppShellMain>...</AppShellMain>
  <AppShellPanelStack>...</AppShellPanelStack>
</AppShellRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AppShellRoot",
    type: 'useRender.ComponentProps<"div"> & { safeAreaSurface?: "chrome" | "content" }',
    description:
      "Owns the responsive row-to-column layout, top safe-area inset, and theme-aware mobile surface.",
  },
  {
    name: "AppShellRail",
    type: 'useRender.ComponentProps<"aside"> & { placement?: "side" | "bottom" | "responsive" }',
    description:
      "Rail region with explicit side, bottom, or responsive placement. Navigation content remains caller-owned children.",
  },
  {
    name: "AppShellSidebar",
    type: 'useRender.ComponentProps<"aside">',
    description: "Desktop sidebar region.",
  },
  {
    name: "AppShellMain",
    type: 'useRender.ComponentProps<"main">',
    description: "Flexible primary content region.",
  },
  {
    name: "AppShellPanelStack",
    type: 'useRender.ComponentProps<"aside">',
    description: "Optional desktop region for caller-owned side panels.",
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
      description="Layout-only foundations for rail, sidebar, main content, and side panels."
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
    </DocPage>
  );
}
