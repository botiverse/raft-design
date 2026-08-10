import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ActivityPreviewComposition } from "#/modules/activity/compositions/activity-preview.composition.tsx";
import activityPreviewCompositionSource from "#/modules/activity/compositions/activity-preview.composition.tsx?raw";
import { EmptyActivityComposition } from "#/modules/activity/compositions/empty-activity.composition.tsx";
import emptyActivityCompositionSource from "#/modules/activity/compositions/empty-activity.composition.tsx?raw";
import { LoadingActivityComposition } from "#/modules/activity/compositions/loading-activity.composition.tsx";
import loadingActivityCompositionSource from "#/modules/activity/compositions/loading-activity.composition.tsx?raw";
import { LoadingMoreActivityComposition } from "#/modules/activity/compositions/loading-more-activity.composition.tsx";
import loadingMoreActivityCompositionSource from "#/modules/activity/compositions/loading-more-activity.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ACTIVITY_COMPOSITION_PATH =
  "apps/doc/src/modules/activity/compositions/activity-preview.composition.tsx";

const SNIPPETS = {
  anatomy: `import {
  Checkbox,
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemMetadata,
  InboxItemSelection,
  InboxItemSender,
  InboxItemSubtitle,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
  PanelAction,
  PanelToggleAction,
} from "raft-ui";

<InboxItem>
  <InboxItemTrigger />
  <InboxItemSelection>
    <Checkbox variant="primary" />
  </InboxItemSelection>
  <InboxItemContent>
    <InboxItemHeading>
      <InboxItemTitle />
    </InboxItemHeading>
    <InboxItemSubtitle />
    <InboxItemBody>
      <InboxItemSender />
    </InboxItemBody>
    <InboxItemMetadata />
  </InboxItemContent>
  <InboxItemTrailing>
    <InboxItemTimestamp />
    <InboxItemActions>
      <PanelToggleAction />
      <PanelAction />
    </InboxItemActions>
  </InboxItemTrailing>
</InboxItem>`,
  composition: activityPreviewCompositionSource,
  empty: emptyActivityCompositionSource,
  loading: loadingActivityCompositionSource,
  loadingMore: loadingMoreActivityCompositionSource,
} as const;

const INBOX_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "active",
    type: "boolean",
    default: "false",
    description: "Marks the opened row and emits data-active for visual styling.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description:
      "Disables row interaction styling and propagates the disabled state to InboxItemTrigger.",
  },
  {
    name: "...props",
    type: "div props",
    description:
      "Generic inbox card frame. data-unread remains available for caller-owned unread emphasis.",
  },
];

const INBOX_ITEM_SELECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Layout slot for a caller-owned Checkbox selection control.",
  },
];

const INBOX_ITEM_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "ReactElement",
    description: "Optionally replaces the native button with a routing link or another trigger.",
  },
  {
    name: "...props",
    type: "button props",
    description: "The full-card interaction target layered behind item content and actions.",
  },
];

const INBOX_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "The primary content column between optional leading and trailing regions.",
  },
];

const INBOX_ITEM_CONTEXT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Message-oriented context row for caller-owned channel, thread, and sender identity content.",
  },
];

const INBOX_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional supporting text rendered above or below the item heading.",
  },
];

const INBOX_ITEM_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Heading row containing the clamped item title.",
  },
];

const INBOX_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Two-line clamped title; a leading inline svg is styled by the slot, and unread emphasis comes from the card's data-unread state.",
  },
];

const INBOX_ITEM_TIMESTAMP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Right-aligned timestamp placed in the trailing rail.",
  },
];

const INBOX_ITEM_TRAILING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Trailing rail that aligns the timestamp and caller-owned actions.",
  },
];

const INBOX_ITEM_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "p props",
    description: "Two-line clamped message preview.",
  },
];

const INBOX_ITEM_MESSAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "p props",
    description:
      "Message-oriented content preview with typography and clamping owned by the InboxItem recipe.",
  },
];

const INBOX_ITEM_SENDER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Bold sender prefix inside the body preview.",
  },
];

const INBOX_ITEM_METADATA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Flexible metadata row for caller-owned badges and secondary information.",
  },
];

const INBOX_ITEM_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Action cluster on the right edge of the card.",
  },
];

const ACTIVITY_INBOX_SHELL_API = [
  {
    id: "api-panel",
    title: "ActivityInboxPanel",
    description:
      "The themed full-height inbox shell; the sidebar and toolbar respond to the viewport at the md breakpoint.",
  },
  {
    id: "api-sidebar",
    title: "ActivityInboxSidebar",
    description:
      "The scrollable inbox navigation rail composed from the shared Sidebar primitives.",
  },
  {
    id: "api-controls",
    title: "ActivityInboxControls",
    description: "The responsive controls row for caller-composed filters, navigation, and search.",
  },
  {
    id: "api-selection-toolbar",
    title: "ActivityInboxSelectionToolbar",
    description:
      "The responsive bulk-selection action row; the caller owns its selection policy and actions.",
  },
  {
    id: "api-selection-count",
    title: "ActivityInboxSelectionCount",
    description: "The selected-item count treatment used within ActivityInboxSelectionToolbar.",
  },
  {
    id: "api-viewport",
    title: "ActivityInboxViewport",
    description: "The scroll viewport with Activity surface, inset, and safe-area treatment.",
  },
  {
    id: "api-loading-more",
    title: "ActivityInboxLoadingMore",
    description: "The loading-more text treatment; the caller decides whether it renders.",
  },
] as const;

const INBOX_ITEM_API_SUBSECTIONS = [
  { id: "api-item", title: "InboxItem", rows: INBOX_ITEM_PROPS },
  { id: "api-item-trigger", title: "InboxItemTrigger", rows: INBOX_ITEM_TRIGGER_PROPS },
  {
    id: "api-item-selection",
    title: "InboxItemSelection",
    rows: INBOX_ITEM_SELECTION_PROPS,
  },
  {
    id: "api-item-content",
    title: "InboxItemContent",
    rows: INBOX_ITEM_CONTENT_PROPS,
  },
  {
    id: "api-item-context",
    title: "InboxItemContext",
    rows: INBOX_ITEM_CONTEXT_PROPS,
  },
  {
    id: "api-item-subtitle",
    title: "InboxItemSubtitle",
    rows: INBOX_ITEM_SUBTITLE_PROPS,
  },
  {
    id: "api-item-heading",
    title: "InboxItemHeading",
    rows: INBOX_ITEM_HEADING_PROPS,
  },
  { id: "api-item-title", title: "InboxItemTitle", rows: INBOX_ITEM_TITLE_PROPS },
  {
    id: "api-item-timestamp",
    title: "InboxItemTimestamp",
    rows: INBOX_ITEM_TIMESTAMP_PROPS,
  },
  {
    id: "api-item-trailing",
    title: "InboxItemTrailing",
    rows: INBOX_ITEM_TRAILING_PROPS,
  },
  { id: "api-item-body", title: "InboxItemBody", rows: INBOX_ITEM_BODY_PROPS },
  {
    id: "api-item-message",
    title: "InboxItemMessage",
    rows: INBOX_ITEM_MESSAGE_PROPS,
  },
  {
    id: "api-item-sender",
    title: "InboxItemSender",
    rows: INBOX_ITEM_SENDER_PROPS,
  },
  {
    id: "api-item-metadata",
    title: "InboxItemMetadata",
    rows: INBOX_ITEM_METADATA_PROPS,
  },
  {
    id: "api-item-actions",
    title: "InboxItemActions",
    rows: INBOX_ITEM_ACTIONS_PROPS,
  },
];

const ACTIVITY_INBOX_API_SUBSECTIONS = ACTIVITY_INBOX_SHELL_API.map(
  ({ id, title, description }) => ({
    id,
    title,
    rows: [{ name: "...props", type: `${title}Props`, description }],
  }),
);

export const Route = createFileRoute("/components/activity")({
  component: ActivityDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ActivityPreview({ code }: { code: Record<string, string> }) {
  return (
    <Preview>
      <Preview.Canvas>
        <ActivityPreviewComposition />
      </Preview.Canvas>
      <Preview.Code codeBlock={<ActivitySourceFiles code={code} collapsible={false} />} />
    </Preview>
  );
}

function ActivityDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ActivityInbox"
      description="Activity-specific inbox shell composed with the reusable InboxItem family."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ActivityPreview code={code} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="grid gap-10">
          <ActivityUsage
            title="Empty"
            id="empty"
            preview={<EmptyActivityComposition />}
            html={code.empty}
            collapsedHtml={code.emptyBody}
          />
          <ActivityUsage
            title="Loading"
            id="loading"
            preview={<LoadingActivityComposition />}
            html={code.loading}
            collapsedHtml={code.loadingBody}
          />
          <ActivityUsage
            title="Loading more"
            id="loading-more"
            preview={<LoadingMoreActivityComposition />}
            html={code.loadingMore}
            collapsedHtml={code.loadingMoreBody}
          />
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <DocSubsection parentId="api" id="api-shell" title="Shell">
          <div className="space-y-6">
            {ACTIVITY_INBOX_API_SUBSECTIONS.map((subsection) => (
              <DocSubsection
                key={subsection.id}
                parentId="api-shell"
                id={subsection.id}
                title={subsection.title}
              >
                <PropsTable rows={subsection.rows} />
              </DocSubsection>
            ))}
          </div>
        </DocSubsection>
        <DocSubsection parentId="api" id="api-item-parts" title="Item">
          <div className="space-y-6">
            {INBOX_ITEM_API_SUBSECTIONS.map((subsection) => (
              <DocSubsection
                key={subsection.id}
                parentId="api"
                id={subsection.id}
                title={subsection.title}
              >
                <PropsTable rows={subsection.rows} />
              </DocSubsection>
            ))}
          </div>
        </DocSubsection>
      </DocSection>
    </DocPage>
  );
}

function ActivityUsage({
  title,
  id,
  preview,
  html,
  collapsedHtml,
}: {
  title: string;
  id: string;
  preview: React.ReactNode;
  html: string;
  collapsedHtml: string;
}) {
  return (
    <DocSubsection parentId="usage" id={id} title={title}>
      <Preview previewClassName="h-80 items-stretch overflow-hidden p-0" previewInset="flush">
        <Preview.Canvas>{preview}</Preview.Canvas>
        <Preview.Code html={html} collapsedHtml={collapsedHtml} />
      </Preview>
    </DocSubsection>
  );
}

/** Canonical composition for the ActivityInbox shell and InboxItem parts. */
function ActivitySourceFiles({
  code,
  collapsible = true,
}: {
  code: Record<string, string>;
  collapsible?: boolean;
}) {
  return (
    <DocsCodeBlock.Files
      collapsible={collapsible}
      showLineNumbers={false}
      files={[
        {
          path: ACTIVITY_COMPOSITION_PATH,
          source: activityPreviewCompositionSource,
          html: code.composition,
          collapsedHtml: code.compositionBody,
        },
      ]}
    />
  );
}
