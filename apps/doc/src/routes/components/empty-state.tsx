import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import { Inbox, Plus, Search, Upload } from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import emptyStateActivityInboxCompositionSource from "#/modules/empty-state/compositions/activity-inbox.composition.tsx?raw";
import emptyStateDefaultCompositionSource from "#/modules/empty-state/compositions/default.composition.tsx?raw";
import emptyStateFilesCompositionSource from "#/modules/empty-state/compositions/files.composition.tsx?raw";
import emptyStateInboxStatusCompositionSource from "#/modules/empty-state/compositions/inbox-status.composition.tsx?raw";
import emptyStateSavedMessagesCompositionSource from "#/modules/empty-state/compositions/saved-messages.composition.tsx?raw";
import emptyStateTaskFilterCompositionSource from "#/modules/empty-state/compositions/task-filter.composition.tsx?raw";
import emptyStateWithActionCompositionSource from "#/modules/empty-state/compositions/with-action.composition.tsx?raw";
import {
  EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION,
  EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION_PATHS,
  EMPTY_STATE_SOURCE_COMPARISON_SOURCE,
} from "#/modules/empty-state/empty-state.source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Inbox, tasks, activity, and saved states",
    scenes: [
      {
        label: "ThreadsInbox.tsx:424",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/thread/ThreadsInbox.tsx:424",
      },
      {
        label: "TasksPanel.tsx:959",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TasksPanel.tsx:959",
      },
      {
        label: "AgentRemindersSection.tsx:146",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentRemindersSection.tsx:146",
      },
      {
        label: "AgentDetailPanel.tsx:186",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:186",
      },
      {
        label: "AgentActivityLog.tsx:328",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentActivityLog.tsx:328",
      },
      {
        label: "ChannelFilesPanel.tsx:254",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChannelFilesPanel.tsx:254",
      },
      {
        label: "ThreadPanel.tsx:1080",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ThreadPanel.tsx:1080",
      },
      {
        label: "ChatPanel.tsx:765",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:765",
      },
      {
        label: "NotificationCenter.tsx:169",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/NotificationCenter.tsx:169",
      },
      {
        label: "MobileComputersPanel.tsx:65",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MobileComputersPanel.tsx:65",
      },
      {
        label: "SavedPanel.tsx:207",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/saved/SavedPanel.tsx:207",
      },
    ],
  },
] as const;

const SNIPPETS = {
  preview: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle>No messages yet</EmptyStateTitle>
    <EmptyStateDescription>
      Conversations you start will show up here.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>`,
  anatomy: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon />
    <EmptyStateTitle />
  </EmptyStateContent>
</EmptyState>`,
  copy: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Search />
    </EmptyStateIcon>
    <EmptyStateTitle>No results for "linear sync"</EmptyStateTitle>
    <EmptyStateDescription>
      Try a different keyword or check the selected filters.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>

<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle>No messages yet</EmptyStateTitle>
    <EmptyStateDescription>
      Conversations you start will show up here.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>`,
  actions: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle>No channels yet</EmptyStateTitle>
    <EmptyStateDescription>
      Create your first channel to start organizing work.
    </EmptyStateDescription>
  </EmptyStateContent>
  <EmptyStateActions className="flex flex-wrap justify-center gap-2">
    <Button variant="primary" size="sm">
      <Plus data-icon="inline-start" />
      New channel
    </Button>
    <Button variant="outline" size="sm">Import</Button>
  </EmptyStateActions>
</EmptyState>`,
  customize: `import { Button, EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "raft-ui";
import { Upload } from "lucide-react";

<EmptyState className="min-h-72">
  <EmptyStateContent>
    <EmptyStateIcon>
      <Upload />
    </EmptyStateIcon>
    <EmptyStateTitle>Drop files to import customers</EmptyStateTitle>
    <EmptyStateDescription>
      CSV and TSV files can be mapped before anything is saved.
    </EmptyStateDescription>
  </EmptyStateContent>
  <div className="mt-5 flex flex-col items-center gap-2">
    <Button variant="primary" size="sm">Choose file</Button>
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
      <button className="underline underline-offset-4 hover:text-foreground-strong">
        Download template
      </button>
      <span aria-hidden>·</span>
      <button className="underline underline-offset-4 hover:text-foreground-strong">
        View import guide
      </button>
    </div>
  </div>
</EmptyState>`,
  composition: `<EmptyState render={<section aria-labelledby="empty-state-title" />}>
  <EmptyStateContent>
    <EmptyStateIcon aria-hidden>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle render={<h2 id="empty-state-title" />}>
      No notifications right now
    </EmptyStateTitle>
    <EmptyStateDescription>
      New mentions, assignments, and approvals will appear here.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Change the root element, for example to section with an aria-labelledby hook.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes plus className.",
  },
];

const EMPTY_STATE_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Recommended wrapper for icon, title, and description. Keeps copy centered, bounded, and balanced.",
  },
];

const EMPTY_STATE_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Muted icon slot. The slot owns default SVG sizing per theme; override with className for custom media.",
  },
];

const EMPTY_STATE_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Muted sentence-case title. Use render to promote it to a real heading.",
  },
];

const EMPTY_STATE_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Optional supporting copy with a readable measure.",
  },
];

const EMPTY_STATE_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Optional action row. Add flex and gap classes when rendering more than one action.",
  },
];

const EmptyStateSource = EMPTY_STATE_SOURCE_COMPARISON_SOURCE;
const EmptyStateCurrent = EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION;

const EMPTY_STATE_COMPOSITION_RAW_SOURCES = {
  Default: emptyStateDefaultCompositionSource,
  WithAction: emptyStateWithActionCompositionSource,
  Files: emptyStateFilesCompositionSource,
  SavedMessages: emptyStateSavedMessagesCompositionSource,
  TaskFilter: emptyStateTaskFilterCompositionSource,
  InboxStatus: emptyStateInboxStatusCompositionSource,
  ActivityInbox: emptyStateActivityInboxCompositionSource,
} as const;

const EMPTY_STATE_COMPOSITION_SOURCES = createCompositionSourceMap(
  EMPTY_STATE_COMPOSITION_RAW_SOURCES,
);

const EMPTY_STATE_COMPOSITION_SNIPPET_IDS = {
  Default: "emptyStateDefaultComposition",
  WithAction: "emptyStateWithActionComposition",
  Files: "emptyStateFilesComposition",
  SavedMessages: "emptyStateSavedMessagesComposition",
  TaskFilter: "emptyStateTaskFilterComposition",
  InboxStatus: "emptyStateInboxStatusComposition",
  ActivityInbox: "emptyStateActivityInboxComposition",
} as const;

type EmptyStateCompositionKey = keyof typeof EMPTY_STATE_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/empty-state")({
  component: EmptyStateDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          EMPTY_STATE_COMPOSITION_SOURCES,
          EMPTY_STATE_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function EmptyStateDoc() {
  const code = Route.useLoaderData();
  const emptyStateComposition = (key: EmptyStateCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: EMPTY_STATE_COMPOSITION_SNIPPET_IDS,
      sources: EMPTY_STATE_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="EmptyState"
      description="A quiet feedback surface for empty collections, filtered results, and first-run states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <EmptyState>
              <EmptyStateContent>
                <EmptyStateIcon>
                  <Inbox />
                </EmptyStateIcon>
                <EmptyStateTitle>No messages yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Conversations you start will show up here.
                </EmptyStateDescription>
              </EmptyStateContent>
            </EmptyState>
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
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="copy" title="Copy">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="grid w-full gap-4 md:grid-cols-2">
                  <EmptyState className="min-h-56">
                    <EmptyStateContent>
                      <EmptyStateIcon>
                        <Search />
                      </EmptyStateIcon>
                      <EmptyStateTitle>No results for "linear sync"</EmptyStateTitle>
                      <EmptyStateDescription>
                        Try a different keyword or check the selected filters.
                      </EmptyStateDescription>
                    </EmptyStateContent>
                  </EmptyState>
                  <EmptyState className="min-h-56">
                    <EmptyStateContent>
                      <EmptyStateIcon>
                        <Inbox />
                      </EmptyStateIcon>
                      <EmptyStateTitle>No messages yet</EmptyStateTitle>
                      <EmptyStateDescription>
                        Conversations you start will show up here.
                      </EmptyStateDescription>
                    </EmptyStateContent>
                  </EmptyState>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.copy} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="actions" title="Actions">
            <Preview>
              <Preview.Canvas>
                <EmptyState>
                  <EmptyStateContent>
                    <EmptyStateIcon>
                      <Inbox />
                    </EmptyStateIcon>
                    <EmptyStateTitle>No channels yet</EmptyStateTitle>
                    <EmptyStateDescription>
                      Create your first channel to start organizing work.
                    </EmptyStateDescription>
                  </EmptyStateContent>
                  <EmptyStateActions className="flex flex-wrap justify-center gap-2">
                    <Button variant="primary" size="sm">
                      <Plus data-icon="inline-start" />
                      New channel
                    </Button>
                    <Button variant="outline" size="sm">
                      Import
                    </Button>
                  </EmptyStateActions>
                </EmptyState>
              </Preview.Canvas>
              <Preview.Code html={code.actions} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customize" title="Customize">
            <Preview>
              <Preview.Canvas>
                <EmptyState className="min-h-72">
                  <EmptyStateContent>
                    <EmptyStateIcon>
                      <Upload />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Drop files to import customers</EmptyStateTitle>
                    <EmptyStateDescription>
                      CSV and TSV files can be mapped before anything is saved.
                    </EmptyStateDescription>
                  </EmptyStateContent>
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <Button variant="primary" size="sm">
                      Choose file
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
                      <button className="underline underline-offset-4 hover:text-foreground-strong">
                        Download template
                      </button>
                      <span aria-hidden>·</span>
                      <button className="underline underline-offset-4 hover:text-foreground-strong">
                        View import guide
                      </button>
                    </div>
                  </div>
                </EmptyState>
              </Preview.Canvas>
              <Preview.Code html={code.customize} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <Preview>
              <Preview.Canvas>
                <EmptyState render={<section aria-labelledby="empty-state-title" />}>
                  <EmptyStateContent>
                    <EmptyStateIcon aria-hidden>
                      <Inbox />
                    </EmptyStateIcon>
                    <EmptyStateTitle render={<h2 id="empty-state-title" />}>
                      No notifications right now
                    </EmptyStateTitle>
                    <EmptyStateDescription>
                      New mentions, assignments, and approvals will appear here.
                    </EmptyStateDescription>
                  </EmptyStateContent>
                </EmptyState>
              </Preview.Canvas>
              <Preview.Code html={code.composition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-empty-state" title="EmptyState">
            <PropsTable rows={PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-content" title="EmptyStateContent">
            <PropsTable rows={EMPTY_STATE_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-icon" title="EmptyStateIcon">
            <PropsTable rows={EMPTY_STATE_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-title" title="EmptyStateTitle">
            <PropsTable rows={EMPTY_STATE_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-empty-state-description"
            title="EmptyStateDescription"
          >
            <PropsTable rows={EMPTY_STATE_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-actions" title="EmptyStateActions">
            <PropsTable rows={EMPTY_STATE_ACTIONS_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Default",
              status: "match",
              note: "Source used icon, title, and description props. Current keeps the visual contract but moves those regions into compound parts.",
              source: <EmptyStateSource.Default />,
              brutal: <EmptyStateCurrent.Default />,
              elegant: <EmptyStateCurrent.Default />,
              elegantDark: <EmptyStateCurrent.Default />,
              ...emptyStateComposition("Default"),
            },
            {
              label: "With action",
              status: "match",
              note: "The old action prop maps to EmptyStateActions so callers can own button semantics, labels, and multi-action layout.",
              source: <EmptyStateSource.WithAction />,
              brutal: <EmptyStateCurrent.WithAction />,
              elegant: <EmptyStateCurrent.WithAction />,
              elegantDark: <EmptyStateCurrent.WithAction />,
              ...emptyStateComposition("WithAction"),
            },
            {
              label: "Files",
              status: "match",
              note: "Source ChannelFilesPanel uses the same primitive for a collection-specific empty panel with longer instructional copy.",
              source: <EmptyStateSource.Files />,
              brutal: <EmptyStateCurrent.Files />,
              elegant: <EmptyStateCurrent.Files />,
              elegantDark: <EmptyStateCurrent.Files />,
              ...emptyStateComposition("Files"),
            },
            {
              label: "Saved messages",
              status: "match",
              note: "Source SavedPanel keeps the title in the base No-object-yet template and uses description copy to explain the saving action.",
              source: <EmptyStateSource.SavedMessages />,
              brutal: <EmptyStateCurrent.SavedMessages />,
              elegant: <EmptyStateCurrent.SavedMessages />,
              elegantDark: <EmptyStateCurrent.SavedMessages />,
              ...emptyStateComposition("SavedMessages"),
            },
            {
              label: "Task filter",
              status: "match",
              note: "Source TasksPanel switches from the base empty title to the filter-empty template when the user has narrowed the task list.",
              source: <EmptyStateSource.TaskFilter />,
              brutal: <EmptyStateCurrent.TaskFilter />,
              elegant: <EmptyStateCurrent.TaskFilter />,
              elegantDark: <EmptyStateCurrent.TaskFilter />,
              ...emptyStateComposition("TaskFilter"),
            },
            {
              label: "Inbox status",
              status: "match",
              note: "Source ThreadsInbox uses a status-type title without yet for binary views such as unread chats.",
              source: <EmptyStateSource.InboxStatus />,
              brutal: <EmptyStateCurrent.InboxStatus />,
              elegant: <EmptyStateCurrent.InboxStatus />,
              elegantDark: <EmptyStateCurrent.InboxStatus />,
              ...emptyStateComposition("InboxStatus"),
            },
            {
              label: "Activity inbox",
              status: "match",
              note: "Source ThreadsInbox also uses a named-container title when the surface itself is the product noun.",
              source: <EmptyStateSource.ActivityInbox />,
              brutal: <EmptyStateCurrent.ActivityInbox />,
              elegant: <EmptyStateCurrent.ActivityInbox />,
              elegantDark: <EmptyStateCurrent.ActivityInbox />,
              ...emptyStateComposition("ActivityInbox"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
