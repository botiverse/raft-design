import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { AppPanelStackPreview } from "#/modules/app-panel-stack/app-panel-stack.preview.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `<AppShellPanelStack>
  <AppPanelStackRoot>
    <AppPanelStackItem>
      <AppPanelStackContent />
    </AppPanelStackItem>
  </AppPanelStackRoot>
</AppShellPanelStack>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AppShellPanelStack",
    type: "aside props",
    description:
      "Desktop right-panel host. Hidden below lg to match the source side-thread column.",
  },
  {
    name: "AppPanelStackRoot",
    type: "div props",
    description: "Stack container. It only exposes visual structure; stack order stays app-owned.",
  },
  {
    name: "AppPanelStackItem",
    type: "section props & { open?: boolean }",
    description: "One right-panel column. Width and persistence are owned by the consumer.",
  },
  {
    name: "AppPanelStackContent",
    type: "div props",
    description:
      "Scrollable content host. Compose resize behavior outside the stack with Resizable primitives.",
  },
];

export const Route = createFileRoute("/components/app-panel-stack")({
  component: AppPanelStackDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AppPanelStackDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AppPanelStack"
      description="Right-side panel stack structure for thread, profile, task, and search-detail side columns."
      overview={
        <Differences from="ThreadPanelWrapper, SideThreadColumn, RightPanel">
          <li>
            does not own thread/profile/task stores, URL sync, modal fallback, or breakpoint logic
          </li>
          <li>keeps source side-column chrome: white panel and left divider</li>
          <li>
            content surfaces remain children; ChatThreadPanel is documented as a separate panel
            surface
          </li>
          <li>resize behavior is composed separately with the generic Resizable primitives</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="source-comparison" title="Source comparison">
        <AppPanelStackPreview />
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
