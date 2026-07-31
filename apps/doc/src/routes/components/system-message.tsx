import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { MessageSystemMessagesComposition } from "#/modules/system-message/compositions/preview.composition.tsx";
import systemMessagePreviewSource from "#/modules/system-message/compositions/preview.composition.tsx?raw";
import channelArchiveSource from "#/modules/system-message/compositions/channel-archive.composition.tsx?raw";
import taskMovedDoneSource from "#/modules/system-message/compositions/task-moved-done.composition.tsx?raw";
import { SystemMessageGroupedUpdatesContent } from "#/modules/system-message/compositions/grouped-updates.composition.tsx";
import groupedUpdatesSource from "#/modules/system-message/compositions/grouped-updates.composition.tsx?raw";
import { SystemMessageGroupedGenericContent } from "#/modules/system-message/compositions/grouped-generic.composition.tsx";
import groupedGenericSource from "#/modules/system-message/compositions/grouped-generic.composition.tsx?raw";
import {
  SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION,
  SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/system-message/system-message.source-comparison.tsx";
import {
  SourceSystemMessageChannelArchive,
  SourceSystemMessageGroupedUpdates,
  SourceSystemMessageTaskMovedDone,
} from "#/modules/system-message/system-message.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock system message row and grouping",
    scenes: [
      {
        label: "MessageItem.tsx (system early-return)",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
      {
        label: "SystemMessageGroupDisclosure.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/SystemMessageGroupDisclosure.tsx",
      },
      {
        label: "systemMessageGrouping.ts",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/systemMessageGrouping.ts",
      },
      {
        label: "ChatPanel.tsx (group render)",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ChatPanel.tsx",
      },
    ],
  },
] as const;

const ANATOMY_SOURCE = `<SystemMessage>
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
  ChannelArchive: channelArchiveSource,
  TaskMovedDone: taskMovedDoneSource,
  GroupedUpdates: groupedUpdatesSource,
});

const COMPOSITION_SNIPPET_IDS = {
  ChannelArchive: "channelArchiveComposition",
  TaskMovedDone: "taskMovedDoneComposition",
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
        channelArchive: channelArchiveSource,
        taskMovedDone: taskMovedDoneSource,
        groupedUpdates: groupedUpdatesSource,
        groupedGeneric: groupedGenericSource,
        ...createCompositionSnippetMap(COMPOSITION_SOURCES, COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function SystemMessageDoc() {
  const code = Route.useLoaderData();
  const SystemMessageCurrent = SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION;
  const systemMessageComposition = (
    key: keyof typeof SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION,
  ) =>
    createCompositionPanelProps({
      code,
      key,
      paths: SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: COMPOSITION_SNIPPET_IDS,
      sources: COMPOSITION_SOURCES,
    });

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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Channel archive",
              status: "match",
              note: "The Source pane is a static DOM fixture extracted from the current MessageItem system early-return. Current maps that structure to SystemMessage + SystemMessageTime + SystemMessageContent.",
              source: (
                <SourceThemeScope>
                  <SourceSystemMessageChannelArchive />
                </SourceThemeScope>
              ),
              brutal: <SystemMessageCurrent.ChannelArchive />,
              elegant: <SystemMessageCurrent.ChannelArchive />,
              elegantDark: <SystemMessageCurrent.ChannelArchive />,
              ...systemMessageComposition("ChannelArchive"),
            },
            {
              label: "Task moved to Done",
              status: "match",
              note: "The Source pane is an extracted static fixture. Task lifecycle copy stays opaque, and Current keeps the source-authored glyph, actor, and title string.",
              source: (
                <SourceThemeScope>
                  <SourceSystemMessageTaskMovedDone />
                </SourceThemeScope>
              ),
              brutal: <SystemMessageCurrent.TaskMovedDone />,
              elegant: <SystemMessageCurrent.TaskMovedDone />,
              elegantDark: <SystemMessageCurrent.TaskMovedDone />,
              ...systemMessageComposition("TaskMovedDone"),
            },
            {
              label: "Grouped updates",
              status: "difference",
              note: "The Source pane reconstructs the current custom disclosure DOM. Current composes Base UI Collapsible parts while product classification stays in the consumer.",
              source: (
                <SourceThemeScope>
                  <SourceSystemMessageGroupedUpdates />
                </SourceThemeScope>
              ),
              brutal: <SystemMessageCurrent.GroupedUpdates />,
              elegant: <SystemMessageCurrent.GroupedUpdates />,
              elegantDark: <SystemMessageCurrent.GroupedUpdates />,
              ...systemMessageComposition("GroupedUpdates"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
