import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageSystemMessagesComposition } from "#/modules/system-message/compositions/preview.composition.tsx";
import systemMessagePreviewSource from "#/modules/system-message/compositions/preview.composition.tsx?raw";
import { SystemMessageGroupedUpdatesContent } from "#/modules/system-message/compositions/grouped-updates.composition.tsx";
import groupedUpdatesSource from "#/modules/system-message/compositions/grouped-updates.composition.tsx?raw";
import { SystemMessageGroupedGenericContent } from "#/modules/system-message/compositions/grouped-generic.composition.tsx";
import groupedGenericSource from "#/modules/system-message/compositions/grouped-generic.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `import {
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroup,
  SystemMessageGroupChevron,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
  SystemMessageTime,
} from "raft-ui";

<SystemMessage>
  <SystemMessageTime />
  <SystemMessageContent>{message.content}</SystemMessageContent>
</SystemMessage>

<SystemMessageGroup open={open} onOpenChange={setOpen}>
  <SystemMessageGroupHeader>
    <SystemMessageGroupDisclosure>
      <SystemMessageGroupSummary>{summary}</SystemMessageGroupSummary>
      <SystemMessageGroupChevron />
    </SystemMessageGroupDisclosure>
  </SystemMessageGroupHeader>
  <SystemMessageGroupPanel>
    <SystemMessage>...</SystemMessage>
  </SystemMessageGroupPanel>
</SystemMessageGroup>`;

const PROPS: readonly PropRow[] = [
  {
    name: "SystemMessage",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered system row for product-authored system events.",
  },
  {
    name: "SystemMessageTime",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline timestamp shown before the system copy.",
  },
  {
    name: "SystemMessageContent",
    type: 'useRender.ComponentProps<"span">',
    description: "System event content slot. Product parsing and copy stay consumer-owned.",
  },
  {
    name: "SystemMessageGroup",
    type: "Collapsible.Root props",
    description: "Base UI Collapsible root for an adjacent-run system-message group.",
  },
  {
    name: "SystemMessageGroupHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered wrap around the group disclosure trigger.",
  },
  {
    name: "SystemMessageGroupDisclosure",
    type: 'useRender.ComponentProps<"button"> (Collapsible.Trigger)',
    description: "Collapsible trigger for the group summary row.",
  },
  {
    name: "SystemMessageGroupSummary",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated summary copy inside the disclosure.",
  },
  {
    name: "SystemMessageGroupChevron",
    type: 'useRender.ComponentProps<"svg">',
    description: "Chevron indicator; rotates via data-panel-open on the disclosure.",
  },
  {
    name: "SystemMessageGroupPanel",
    type: "Collapsible.Panel props",
    description: "Expanded details slot that hosts the grouped SystemMessage rows.",
  },
];

const COMPOSITION_SOURCES = createCompositionSourceMap({
  GroupedUpdates: groupedUpdatesSource,
});

const COMPOSITION_SNIPPET_IDS = {
  GroupedUpdates: "groupedUpdatesComposition",
} as const;

function GroupedUsagePreview({
  children,
  code,
  collapsedCode,
}: {
  children: ReactNode;
  code: ReactNode;
  collapsedCode: ReactNode;
}) {
  return (
    <Preview previewClassName="items-center">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

export const Route = createFileRoute("/components/system-message")({
  component: SystemMessageDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        preview: systemMessagePreviewSource,
        groupedUpdates: groupedUpdatesSource,
        groupedGeneric: groupedGenericSource,
        ...createCompositionSnippetMap(COMPOSITION_SOURCES, COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function SystemMessageDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SystemMessage"
      description="Centered system-event rows and consumer-owned adjacent-run grouping."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-center">
          <Preview.Canvas>
            <MessageSystemMessagesComposition />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
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
          <DocSubsection parentId="usage" id="grouped-updates" title="Grouped updates">
            <GroupedUsagePreview code={code.groupedUpdates} collapsedCode={code.groupedUpdatesBody}>
              <SystemMessageGroupedUpdatesContent />
            </GroupedUsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="grouped-generic" title="Grouped generic">
            <GroupedUsagePreview code={code.groupedGeneric} collapsedCode={code.groupedGenericBody}>
              <SystemMessageGroupedGenericContent />
            </GroupedUsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <DocSubsection parentId="api" id="api-parts" title="Parts">
          <PropsTable rows={PROPS} />
        </DocSubsection>
      </DocSection>
    </DocPage>
  );
}
