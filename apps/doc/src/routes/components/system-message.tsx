import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
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
import previewSource from "#/modules/system-message/compositions/preview.composition.tsx?raw";
import { SystemMessageChannelArchiveContent } from "#/modules/system-message/compositions/channel-archive.composition.tsx";
import channelArchiveSource from "#/modules/system-message/compositions/channel-archive.composition.tsx?raw";
import { SystemMessageChannelUnarchiveContent } from "#/modules/system-message/compositions/channel-unarchive.composition.tsx";
import channelUnarchiveSource from "#/modules/system-message/compositions/channel-unarchive.composition.tsx?raw";
import { SystemMessageChannelRenameContent } from "#/modules/system-message/compositions/channel-rename.composition.tsx";
import channelRenameSource from "#/modules/system-message/compositions/channel-rename.composition.tsx?raw";
import { SystemMessageAgentAddedContent } from "#/modules/system-message/compositions/agent-added.composition.tsx";
import agentAddedSource from "#/modules/system-message/compositions/agent-added.composition.tsx?raw";
import { SystemMessageAgentRemovedContent } from "#/modules/system-message/compositions/agent-removed.composition.tsx";
import agentRemovedSource from "#/modules/system-message/compositions/agent-removed.composition.tsx?raw";
import { SystemMessageAgentJoinedContent } from "#/modules/system-message/compositions/agent-joined.composition.tsx";
import agentJoinedSource from "#/modules/system-message/compositions/agent-joined.composition.tsx?raw";
import { SystemMessageTaskCreatedContent } from "#/modules/system-message/compositions/task-created.composition.tsx";
import taskCreatedSource from "#/modules/system-message/compositions/task-created.composition.tsx?raw";
import { SystemMessageTaskConvertedContent } from "#/modules/system-message/compositions/task-converted.composition.tsx";
import taskConvertedSource from "#/modules/system-message/compositions/task-converted.composition.tsx?raw";
import { SystemMessageTaskClaimedContent } from "#/modules/system-message/compositions/task-claimed.composition.tsx";
import taskClaimedSource from "#/modules/system-message/compositions/task-claimed.composition.tsx?raw";
import { SystemMessageTaskReleasedContent } from "#/modules/system-message/compositions/task-released.composition.tsx";
import taskReleasedSource from "#/modules/system-message/compositions/task-released.composition.tsx?raw";
import { SystemMessageTaskMovedTodoContent } from "#/modules/system-message/compositions/task-moved-todo.composition.tsx";
import taskMovedTodoSource from "#/modules/system-message/compositions/task-moved-todo.composition.tsx?raw";
import { SystemMessageTaskMovedInProgressContent } from "#/modules/system-message/compositions/task-moved-in-progress.composition.tsx";
import taskMovedInProgressSource from "#/modules/system-message/compositions/task-moved-in-progress.composition.tsx?raw";
import { SystemMessageTaskMovedInReviewContent } from "#/modules/system-message/compositions/task-moved-in-review.composition.tsx";
import taskMovedInReviewSource from "#/modules/system-message/compositions/task-moved-in-review.composition.tsx?raw";
import { SystemMessageTaskMovedDoneContent } from "#/modules/system-message/compositions/task-moved-done.composition.tsx";
import taskMovedDoneSource from "#/modules/system-message/compositions/task-moved-done.composition.tsx?raw";
import { SystemMessageTaskMovedClosedContent } from "#/modules/system-message/compositions/task-moved-closed.composition.tsx";
import taskMovedClosedSource from "#/modules/system-message/compositions/task-moved-closed.composition.tsx?raw";
import { SystemMessageTaskDeletedContent } from "#/modules/system-message/compositions/task-deleted.composition.tsx";
import taskDeletedSource from "#/modules/system-message/compositions/task-deleted.composition.tsx?raw";
import { SystemMessageTaskAssignedContent } from "#/modules/system-message/compositions/task-assigned.composition.tsx";
import taskAssignedSource from "#/modules/system-message/compositions/task-assigned.composition.tsx?raw";
import { SystemMessageTaskStartedContent } from "#/modules/system-message/compositions/task-started.composition.tsx";
import taskStartedSource from "#/modules/system-message/compositions/task-started.composition.tsx?raw";
import { SystemMessageOnboardingAllUnlockContent } from "#/modules/system-message/compositions/onboarding-all-unlock.composition.tsx";
import onboardingAllUnlockSource from "#/modules/system-message/compositions/onboarding-all-unlock.composition.tsx?raw";
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

const states = buildProductSystemMessageRenderStates(messages);

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

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

export const Route = createFileRoute("/components/system-message")({
  component: SystemMessageDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        preview: previewSource,
        channelArchive: channelArchiveSource,
        channelUnarchive: channelUnarchiveSource,
        channelRename: channelRenameSource,
        agentAdded: agentAddedSource,
        agentRemoved: agentRemovedSource,
        agentJoined: agentJoinedSource,
        taskCreated: taskCreatedSource,
        taskConverted: taskConvertedSource,
        taskClaimed: taskClaimedSource,
        taskReleased: taskReleasedSource,
        taskMovedTodo: taskMovedTodoSource,
        taskMovedInProgress: taskMovedInProgressSource,
        taskMovedInReview: taskMovedInReviewSource,
        taskMovedDone: taskMovedDoneSource,
        taskMovedClosed: taskMovedClosedSource,
        taskDeleted: taskDeletedSource,
        taskAssigned: taskAssignedSource,
        taskStarted: taskStartedSource,
        onboardingAllUnlock: onboardingAllUnlockSource,
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
      <DocNote>
        Current reminder scheduling and firing do not write chat messages. Reminder audit and wake
        delivery belong to the reminder product surface, so this page intentionally shows no
        reminder rows.
      </DocNote>
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
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
          <DocSubsection parentId="usage" id="channel-archive" title="Channel archive">
            <UsagePreview code={code.channelArchive}>
              <SystemMessageChannelArchiveContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="channel-unarchive" title="Channel unarchive">
            <UsagePreview code={code.channelUnarchive}>
              <SystemMessageChannelUnarchiveContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="channel-rename" title="Channel rename">
            <UsagePreview code={code.channelRename}>
              <SystemMessageChannelRenameContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="agent-added" title="Agent added">
            <UsagePreview code={code.agentAdded}>
              <SystemMessageAgentAddedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="agent-removed" title="Agent removed">
            <UsagePreview code={code.agentRemoved}>
              <SystemMessageAgentRemovedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="agent-joined" title="Agent joined">
            <UsagePreview code={code.agentJoined}>
              <SystemMessageAgentJoinedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-created" title="Task created">
            <UsagePreview code={code.taskCreated}>
              <SystemMessageTaskCreatedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-converted" title="Task converted">
            <UsagePreview code={code.taskConverted}>
              <SystemMessageTaskConvertedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-claimed" title="Task claimed">
            <UsagePreview code={code.taskClaimed}>
              <SystemMessageTaskClaimedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-released" title="Task released">
            <UsagePreview code={code.taskReleased}>
              <SystemMessageTaskReleasedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-moved-todo" title="Task moved to Todo">
            <UsagePreview code={code.taskMovedTodo}>
              <SystemMessageTaskMovedTodoContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection
            parentId="usage"
            id="task-moved-in-progress"
            title="Task moved to In Progress"
          >
            <UsagePreview code={code.taskMovedInProgress}>
              <SystemMessageTaskMovedInProgressContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-moved-in-review" title="Task moved to In Review">
            <UsagePreview code={code.taskMovedInReview}>
              <SystemMessageTaskMovedInReviewContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-moved-done" title="Task moved to Done">
            <UsagePreview code={code.taskMovedDone}>
              <SystemMessageTaskMovedDoneContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-moved-closed" title="Task moved to Closed">
            <UsagePreview code={code.taskMovedClosed}>
              <SystemMessageTaskMovedClosedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-deleted" title="Task deleted">
            <UsagePreview code={code.taskDeleted}>
              <SystemMessageTaskDeletedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-assigned" title="Task assigned">
            <UsagePreview code={code.taskAssigned}>
              <SystemMessageTaskAssignedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="task-started" title="Task started">
            <UsagePreview code={code.taskStarted}>
              <SystemMessageTaskStartedContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="onboarding-all-unlock" title="Onboarding #all unlock">
            <UsagePreview code={code.onboardingAllUnlock}>
              <SystemMessageOnboardingAllUnlockContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="grouped-updates" title="Grouped updates">
            <UsagePreview code={code.groupedUpdates}>
              <SystemMessageGroupedUpdatesContent />
            </UsagePreview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="grouped-generic" title="Grouped generic">
            <UsagePreview code={code.groupedGeneric}>
              <SystemMessageGroupedGenericContent />
            </UsagePreview>
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
