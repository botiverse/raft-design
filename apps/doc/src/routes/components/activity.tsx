import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ActivityPreviewComposition } from "#/modules/activity/compositions/activity-preview.composition.tsx";
import activityPreviewCompositionSource from "#/modules/activity/compositions/activity-preview.composition.tsx?raw";
import { CompactActivityComposition } from "#/modules/activity/compositions/compact-activity.composition.tsx";
import compactActivityCompositionSource from "#/modules/activity/compositions/compact-activity.composition.tsx?raw";
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

const LAYOUTS = ["wide", "compact"] as const;

const ACTIVITY_COMPOSITION_PATH =
  "apps/doc/src/modules/activity/compositions/activity-preview.composition.tsx";

const SNIPPETS = {
  shellAnatomy: `import {
  Button,
  ConversationPanelContent,
  InputGroup,
  InputGroupInput,
  PanelHeader,
  PanelHeaderContent,
  PanelMeta,
  PanelTitle,
} from "raft-ui";
import {
  ActivityInboxControls,
  ActivityInboxNavigationCount,
  ActivityInboxNavigationItem,
  ActivityInboxNavigationLabel,
  ActivityInboxPanel,
  ActivityInboxSelectionToolbar,
  ActivityInboxSidebar,
  ActivityInboxSidebarHeading,
  ActivityInboxSidebarHeadingLabel,
  ActivityInboxToolbarAction,
  ActivityInboxViewport,
} from "raft-ui/wip";

<ActivityInboxPanel>
  <PanelHeader>
    <PanelHeaderContent>
      <PanelTitle render={<h2 />} />
      <PanelMeta render={<p />} />
    </PanelHeaderContent>
  </PanelHeader>
  <div className="flex min-h-0 flex-1">
    <ActivityInboxSidebar>
      <ActivityInboxSidebarHeading>
        <ActivityInboxSidebarHeadingLabel />
      </ActivityInboxSidebarHeading>
      <ActivityInboxNavigationItem>
        <ActivityInboxNavigationLabel />
        <ActivityInboxNavigationCount />
      </ActivityInboxNavigationItem>
    </ActivityInboxSidebar>
    <ConversationPanelContent render={<section />}>
      <ActivityInboxControls>
        <InputGroup>
          <InputGroupInput aria-label="Search activity" />
        </InputGroup>
      </ActivityInboxControls>
      <ActivityInboxSelectionToolbar>
        <ActivityInboxToolbarAction variant="secondary">Select all</ActivityInboxToolbarAction>
        <Button size="xs">Deselect</Button>
      </ActivityInboxSelectionToolbar>
      <ActivityInboxViewport />
    </ConversationPanelContent>
  </div>
</ActivityInboxPanel>`,
  anatomy: `import {
  Checkbox,
  PanelAction,
  PanelToggleAction,
} from "raft-ui";
import {
  ActivityInboxItem,
  ActivityInboxItemActions,
  ActivityInboxItemBody,
  ActivityInboxItemContent,
  ActivityInboxItemHeading,
  ActivityInboxItemMetadata,
  ActivityInboxItemOpen,
  ActivityInboxItemSelection,
  ActivityInboxItemSender,
  ActivityInboxItemSubtitle,
  ActivityInboxItemTimestamp,
  ActivityInboxItemTitle,
  ActivityInboxItemTrailing,
  ActivityInboxList,
} from "raft-ui/wip";

<ActivityInboxList>
  <ActivityInboxItem>
    {/* full-card open target layered behind the content */}
    <ActivityInboxItemOpen />
    <ActivityInboxItemSelection>
      <Checkbox />
    </ActivityInboxItemSelection>
    <ActivityInboxItemContent>
      {/* thread rows only */}
      <ActivityInboxItemSubtitle />
      <ActivityInboxItemHeading>
        {/* an inline leading svg is styled by the title */}
        <ActivityInboxItemTitle />
      </ActivityInboxItemHeading>
      <ActivityInboxItemBody>
        <ActivityInboxItemSender />
      </ActivityInboxItemBody>
      {/* caller-owned badges */}
      <ActivityInboxItemMetadata />
    </ActivityInboxItemContent>
    <ActivityInboxItemTrailing>
      <ActivityInboxItemTimestamp />
      <ActivityInboxItemActions>
        <PanelToggleAction />
        <PanelAction />
      </ActivityInboxItemActions>
    </ActivityInboxItemTrailing>
  </ActivityInboxItem>
</ActivityInboxList>`,
  menuAnatomy: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemLabel,
  ContextMenuTrigger,
} from "raft-ui";

<ContextMenu>
  <ContextMenuTrigger render={<button type="button">Activity item</button>} />
  <ContextMenuContent>
    <ContextMenuItem>
      <ContextMenuItemLabel />
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  composition: activityPreviewCompositionSource,
  compact: compactActivityCompositionSource,
  empty: emptyActivityCompositionSource,
  loading: loadingActivityCompositionSource,
  loadingMore: loadingMoreActivityCompositionSource,
} as const;

const ACTIVITY_INBOX_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Vertical stack layout for activity row cards.",
  },
];

const ACTIVITY_INBOX_ITEM_PROPS: readonly PropRow[] = [
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
      "Disables row interaction styling through data-disabled and mirrors the state to aria-disabled.",
  },
  {
    name: "...props",
    type: "div props",
    description:
      "Activity row card frame. data-unread remains available for caller-owned unread emphasis.",
  },
];

const ACTIVITY_INBOX_ITEM_OPEN_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description:
      "Full-card open target layered behind the content so selection and actions stay independently interactive.",
  },
];

const ACTIVITY_INBOX_ITEM_SELECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Layout slot for a caller-owned Checkbox selection control.",
  },
];

const ACTIVITY_INBOX_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Text column between the selection control and the action cluster.",
  },
];

const ACTIVITY_INBOX_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Channel line rendered above the title on thread rows.",
  },
];

const ACTIVITY_INBOX_ITEM_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Heading row containing the clamped activity title.",
  },
];

const ACTIVITY_INBOX_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Two-line clamped title; a leading inline svg child is sized and tinted by the title, and unread emphasis comes from the card's data-unread state.",
  },
];

const ACTIVITY_INBOX_ITEM_TIMESTAMP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Right-aligned timestamp placed in the trailing rail.",
  },
];

const ACTIVITY_INBOX_ITEM_TRAILING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Trailing rail that aligns the timestamp and caller-owned actions.",
  },
];

const ACTIVITY_INBOX_ITEM_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "p props",
    description: "Two-line clamped message preview.",
  },
];

const ACTIVITY_INBOX_ITEM_SENDER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Bold sender prefix inside the body preview.",
  },
];

const ACTIVITY_INBOX_ITEM_METADATA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Badge row under the body for replies, mentions, unread counts, and drafts.",
  },
];

const ACTIVITY_INBOX_ITEM_ACTIONS_PROPS: readonly PropRow[] = [
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
    id: "api-navigation-item",
    title: "ActivityInboxNavigationItem",
    description:
      "A SidebarItem-based Activity view or filter item. active drives data-active styling; aria-current and aria-pressed remain caller-owned semantics.",
  },
  {
    id: "api-navigation-label",
    title: "ActivityInboxNavigationLabel",
    description: "The truncating text region within an Activity navigation item.",
  },
  {
    id: "api-navigation-count",
    title: "ActivityInboxNavigationCount",
    description: "The trailing count region within an Activity navigation item.",
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
    id: "api-toolbar-action",
    title: "ActivityInboxToolbarAction",
    description:
      "Bulk-selection toolbar action built on Button; variant selects secondary, primary, link, or ghost treatments.",
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
  {
    id: "api-header-icon",
    title: "ActivityInboxHeaderIcon",
    description:
      "The scene-specific identity chip in the header; delegates to PanelHeaderIcon. The bar, content region, title, and subtitle are the shared PanelHeader parts.",
  },
  {
    id: "api-sidebar-heading",
    title: "ActivityInboxSidebarHeading",
    description: "A sidebar section heading row.",
  },
  {
    id: "api-sidebar-heading-label",
    title: "ActivityInboxSidebarHeadingLabel",
    description: "The sidebar heading label.",
  },
] as const;

const API_SUBSECTIONS = [
  { id: "api-list", title: "ActivityInboxList", rows: ACTIVITY_INBOX_LIST_PROPS },
  { id: "api-item", title: "ActivityInboxItem", rows: ACTIVITY_INBOX_ITEM_PROPS },
  { id: "api-item-open", title: "ActivityInboxItemOpen", rows: ACTIVITY_INBOX_ITEM_OPEN_PROPS },
  {
    id: "api-item-selection",
    title: "ActivityInboxItemSelection",
    rows: ACTIVITY_INBOX_ITEM_SELECTION_PROPS,
  },
  {
    id: "api-item-content",
    title: "ActivityInboxItemContent",
    rows: ACTIVITY_INBOX_ITEM_CONTENT_PROPS,
  },
  {
    id: "api-item-subtitle",
    title: "ActivityInboxItemSubtitle",
    rows: ACTIVITY_INBOX_ITEM_SUBTITLE_PROPS,
  },
  {
    id: "api-item-heading",
    title: "ActivityInboxItemHeading",
    rows: ACTIVITY_INBOX_ITEM_HEADING_PROPS,
  },
  { id: "api-item-title", title: "ActivityInboxItemTitle", rows: ACTIVITY_INBOX_ITEM_TITLE_PROPS },
  {
    id: "api-item-timestamp",
    title: "ActivityInboxItemTimestamp",
    rows: ACTIVITY_INBOX_ITEM_TIMESTAMP_PROPS,
  },
  {
    id: "api-item-trailing",
    title: "ActivityInboxItemTrailing",
    rows: ACTIVITY_INBOX_ITEM_TRAILING_PROPS,
  },
  { id: "api-item-body", title: "ActivityInboxItemBody", rows: ACTIVITY_INBOX_ITEM_BODY_PROPS },
  {
    id: "api-item-sender",
    title: "ActivityInboxItemSender",
    rows: ACTIVITY_INBOX_ITEM_SENDER_PROPS,
  },
  {
    id: "api-item-metadata",
    title: "ActivityInboxItemMetadata",
    rows: ACTIVITY_INBOX_ITEM_METADATA_PROPS,
  },
  {
    id: "api-item-actions",
    title: "ActivityInboxItemActions",
    rows: ACTIVITY_INBOX_ITEM_ACTIONS_PROPS,
  },
  ...ACTIVITY_INBOX_SHELL_API.map(({ id, title, description }) => ({
    id,
    title,
    rows: [{ name: "...props", type: `${title}Props`, description }],
  })),
] as const;

export const Route = createFileRoute("/components/activity")({
  component: ActivityDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ActivityPreview({ code }: { code: Record<string, string> }) {
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]>("wide");

  return (
    <Preview
      previewInset="flush"
      previewClassName={
        layout === "compact"
          ? "h-[42rem] max-w-md items-stretch overflow-hidden p-0"
          : "h-[42rem] items-stretch overflow-hidden p-0"
      }
    >
      <Preview.Canvas>
        <ActivityPreviewComposition />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Layout" htmlFor="activity-preview-layout">
          <Preview.Select
            id="activity-preview-layout"
            label="Layout"
            options={LAYOUTS}
            value={layout}
            onValueChange={(value) => setLayout(value as (typeof LAYOUTS)[number])}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code codeBlock={<ActivitySourceFiles code={code} collapsible={false} />} />
    </Preview>
  );
}

function ActivityDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ActivityInbox"
      description="Business-agnostic inbox shell and item parts for composing activity workflows."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ActivityPreview code={code} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocSubsection parentId="anatomy" id="shell-anatomy" title="Shell">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content
                html={code.shellAnatomy}
                collapsedHtml={code.shellAnatomyBody}
              />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </DocSubsection>
        <DocSubsection parentId="anatomy" id="item-anatomy" title="Item">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </DocSubsection>
        <DocSubsection parentId="anatomy" id="item-menu-anatomy" title="Item menu">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.menuAnatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </DocSubsection>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="grid gap-10">
          <ActivityUsage
            title="Compact"
            id="compact"
            compact
            preview={<CompactActivityComposition />}
            html={code.compact}
            collapsedHtml={code.compactBody}
          />
          <ActivityUsage
            title="Empty"
            id="empty"
            preview={<EmptyActivityComposition />}
            html={code.empty}
            collapsedHtml={code.emptyBody}
          />
          <ActivityUsage
            title="Initial loading"
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
            {API_SUBSECTIONS.slice(14).map((subsection) => (
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
            {API_SUBSECTIONS.slice(0, 14).map((subsection) => (
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
  compact = false,
}: {
  title: string;
  id: string;
  preview: React.ReactNode;
  html: string;
  collapsedHtml: string;
  compact?: boolean;
}) {
  return (
    <DocSubsection parentId="usage" id={id} title={title}>
      <Preview
        previewClassName={
          compact
            ? "h-[42rem] max-w-md items-stretch overflow-hidden p-0"
            : "h-[42rem] items-stretch overflow-hidden p-0"
        }
        previewInset="flush"
      >
        <Preview.Canvas>{preview}</Preview.Canvas>
        <Preview.Code html={html} collapsedHtml={collapsedHtml} />
      </Preview>
    </DocSubsection>
  );
}

/** Canonical composition for the ActivityInbox package parts. */
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
