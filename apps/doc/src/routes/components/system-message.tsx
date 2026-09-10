import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
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

const SYSTEM_MESSAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered system row for product-authored system events.",
  },
];

const SYSTEM_MESSAGE_TIME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline timestamp shown before the system copy.",
  },
];

const SYSTEM_MESSAGE_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "title",
    type: "string",
    description: "Tooltip title. Defaults to the string children when present.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "System event content slot. Product parsing and copy stay consumer-owned.",
  },
];

const SYSTEM_MESSAGE_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state for the group.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    description: "Default open state for the uncontrolled group.",
  },
  {
    name: "onOpenChange",
    type: "Collapsible.Root.Props['onOpenChange']",
    description: "Callback fired when the group open state changes.",
  },
  {
    name: "...props",
    type: "Base UI Collapsible.Root.Props",
    description: "Base UI Collapsible root for an adjacent-run system-message group.",
  },
];

const SYSTEM_MESSAGE_GROUP_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered wrap around the group disclosure trigger.",
  },
];

const SYSTEM_MESSAGE_GROUP_DISCLOSURE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button"> (Collapsible.Trigger)',
    description: "Collapsible trigger for the group summary row.",
  },
];

const SYSTEM_MESSAGE_GROUP_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated summary copy inside the disclosure.",
  },
];

const SYSTEM_MESSAGE_GROUP_CHEVRON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"svg">',
    description: "Chevron indicator; rotates via data-panel-open on the disclosure.",
  },
];

const SYSTEM_MESSAGE_GROUP_PANEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Collapsible.Panel.Props",
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
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-system-message" title="SystemMessage">
            <PropsTable rows={SYSTEM_MESSAGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-system-message-time" title="SystemMessageTime">
            <PropsTable rows={SYSTEM_MESSAGE_TIME_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-system-message-content"
            title="SystemMessageContent"
          >
            <PropsTable rows={SYSTEM_MESSAGE_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-system-message-group" title="SystemMessageGroup">
            <PropsTable rows={SYSTEM_MESSAGE_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-system-message-group-header"
            title="SystemMessageGroupHeader"
          >
            <PropsTable rows={SYSTEM_MESSAGE_GROUP_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-system-message-group-disclosure"
            title="SystemMessageGroupDisclosure"
          >
            <PropsTable rows={SYSTEM_MESSAGE_GROUP_DISCLOSURE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-system-message-group-summary"
            title="SystemMessageGroupSummary"
          >
            <PropsTable rows={SYSTEM_MESSAGE_GROUP_SUMMARY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-system-message-group-chevron"
            title="SystemMessageGroupChevron"
          >
            <PropsTable rows={SYSTEM_MESSAGE_GROUP_CHEVRON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-system-message-group-panel"
            title="SystemMessageGroupPanel"
          >
            <PropsTable rows={SYSTEM_MESSAGE_GROUP_PANEL_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
