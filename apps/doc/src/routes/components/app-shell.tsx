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
    </DocPage>
  );
}
