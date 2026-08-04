import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import activityPanelPartsSource from "#/modules/activity/activity-panel.parts.tsx?raw";
import { ActivityV2SourcePreview } from "#/modules/activity/activity.source-preview.tsx";
import { ActivityInboxComposition } from "#/modules/activity/compositions/activity-inbox.composition.tsx";
import activityInboxCompositionSource from "#/modules/activity/compositions/activity-inbox.composition.tsx?raw";
import { CompactActivityComposition } from "#/modules/activity/compositions/compact-activity.composition.tsx";
import { DoneActivityComposition } from "#/modules/activity/compositions/done-activity.composition.tsx";
import { EmptyActivityComposition } from "#/modules/activity/compositions/empty-activity.composition.tsx";
import { LoadingActivityComposition } from "#/modules/activity/compositions/loading-activity.composition.tsx";
import { LoadingMoreActivityComposition } from "#/modules/activity/compositions/loading-more-activity.composition.tsx";
import { SavedActivityComposition } from "#/modules/activity/compositions/saved-activity.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const LAYOUTS = ["wide", "compact"] as const;

const SOURCE_SCENES = [
  {
    label: "Slock Activity",
    scenes: [
      {
        label: "ThreadsInbox.tsx",
        path: "packages/ui/source/activity/ActivityV2SourcePreview.tsx",
      },
      {
        label: "source commit 6cd65a094",
        path: "packages/ui/source/activity/README.md",
      },
    ],
  },
] as const;

const ACTIVITY_COMPOSITION_PATH =
  "apps/doc/src/modules/activity/compositions/activity-inbox.composition.tsx";
const ACTIVITY_PARTS_PATH = "apps/doc/src/modules/activity/activity-panel.parts.tsx";

const SNIPPETS = {
  anatomy: `<ActivityInboxList>
  <ActivityInboxItem>
    {/* full-card open target layered behind the content */}
    <ActivityInboxItemOpen />
    <ActivityInboxItemSelection />
    <ActivityInboxItemContent>
      {/* thread rows only */}
      <ActivityInboxItemSubtitle />
      <ActivityInboxItemHeading>
        {/* an inline leading svg is styled by the title */}
        <ActivityInboxItemTitle />
        <ActivityInboxItemTimestamp />
      </ActivityInboxItemHeading>
      <ActivityInboxItemBody>
        <ActivityInboxItemSender />
      </ActivityInboxItemBody>
      {/* caller-owned badges */}
      <ActivityInboxItemMetadata />
    </ActivityInboxItemContent>
    <ActivityInboxItemActions>
      <ActivityInboxItemAction />
      <ActivityInboxItemSavedAction />
    </ActivityInboxItemActions>
  </ActivityInboxItem>
</ActivityInboxList>`,
  menuAnatomy: `<ContextMenu>
  <ContextMenuTrigger render={row} />
  <ActivityInboxItemMenuContent>
    <ActivityInboxItemMenuItem>
      <ContextMenuItemLabel />
    </ActivityInboxItemMenuItem>
  </ActivityInboxItemMenuContent>
</ContextMenu>`,
  composition: activityInboxCompositionSource,
  parts: activityPanelPartsSource,
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
    name: "...props",
    type: "div props",
    description:
      "Activity row card frame. data-unread drives the unread emphasis and data-active drives the opened treatment.",
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
    name: "checked",
    type: "boolean",
    description: "Controlled selection state, exposed as aria-checked on the checkbox-role button.",
  },
  {
    name: "onCheckedChange",
    type: "(checked: boolean) => void",
    description:
      "Called with the next selection state. Click propagation to the open target is stopped.",
  },
  {
    name: "...props",
    type: "button props",
    description: "The caller owns the accessible label and the checked indicator child.",
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
    description: "Row pairing the clamped title with the timestamp.",
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
    description: "Right-aligned monospace timestamp.",
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

const ACTIVITY_INBOX_ITEM_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Square bordered card action button (save, done, restore).",
  },
];

const ACTIVITY_INBOX_ITEM_SAVED_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Saved-state variant of the card action with the orange saved treatment.",
  },
];

const ACTIVITY_INBOX_ITEM_MENU_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ContextMenuContent props",
    description: "ContextMenuContent styled for activity row context menus.",
  },
];

const ACTIVITY_INBOX_ITEM_MENU_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ContextMenuItem props",
    description: "ContextMenuItem styled for activity row context menus.",
  },
];

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
  {
    id: "api-item-action",
    title: "ActivityInboxItemAction",
    rows: ACTIVITY_INBOX_ITEM_ACTION_PROPS,
  },
  {
    id: "api-item-saved-action",
    title: "ActivityInboxItemSavedAction",
    rows: ACTIVITY_INBOX_ITEM_SAVED_ACTION_PROPS,
  },
  {
    id: "api-item-menu-content",
    title: "ActivityInboxItemMenuContent",
    rows: ACTIVITY_INBOX_ITEM_MENU_CONTENT_PROPS,
  },
  {
    id: "api-item-menu-item",
    title: "ActivityInboxItemMenuItem",
    rows: ACTIVITY_INBOX_ITEM_MENU_ITEM_PROPS,
  },
] as const;

const STATE_EXAMPLES = [
  { label: "Saved", preview: <SavedActivityComposition />, compact: false },
  { label: "Done", preview: <DoneActivityComposition />, compact: false },
  { label: "Compact", preview: <CompactActivityComposition />, compact: true },
  { label: "Empty", preview: <EmptyActivityComposition />, compact: false },
  { label: "Initial loading", preview: <LoadingActivityComposition />, compact: false },
  {
    label: "Loading more",
    preview: <LoadingMoreActivityComposition />,
    compact: false,
  },
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
        <ActivityInboxComposition layout={layout} />
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
      description="Activity row card family; the surrounding inbox shell is composed from the generic Panel container."
      overview={
        <ul className="list-disc space-y-1 pl-4">
          <li>
            raft-ui owns the activity row card: frame, open target, selection, text column, metadata
            badges, and card actions
          </li>
          <li>
            the inbox shell (header, sidebar, controls, toolbar, viewport) is composed in the docs
            module from Panel, PanelHeaderRoot, and local panel parts
          </li>
          <li>
            stores, transport, routing, analytics, feature flags, and product workflow state stay in
            the consumer
          </li>
        </ul>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ActivityPreview code={code} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.menuAnatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <p>
          ActivityInbox owns the row card and the keyboard behavior of its nested open, selection,
          and action controls. The inbox shell around it — header, view sidebar, filter controls,
          selection toolbar, and scroll viewport — is not part of the raft-ui API: the executable
          composition assembles it from the generic Panel container and local panel parts.
          Production consumers own item unions, read/save/done policy, server synchronization,
          search and sort persistence, navigation, and master/detail coordination.
        </p>
        <DocSubsection parentId="usage" id="states" title="States">
          <div className="grid gap-8">
            {STATE_EXAMPLES.map((example) => (
              <div key={example.label} className="grid gap-3">
                <h3 className="text-sm font-medium text-foreground-strong">{example.label}</h3>
                <Preview
                  previewClassName={
                    example.compact
                      ? "h-[42rem] max-w-md items-stretch overflow-hidden p-0"
                      : "h-[42rem] items-stretch overflow-hidden p-0"
                  }
                  previewInset="flush"
                  previewTheme="brutal"
                >
                  <Preview.Canvas>{example.preview}</Preview.Canvas>
                </Preview>
              </div>
            ))}
          </div>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          {API_SUBSECTIONS.map((subsection) => (
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
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              label: "Activity v2 inbox",
              status: "difference",
              note: "Brutal preserves the source visual class contract while replacing the source row's nested interactive markup with pixel-neutral sibling buttons. The composition replaces source stores and API calls with deterministic local state. Existing Badge and SegmentedControl primitives are retained because the source already consumes raft-ui. Elegant re-expresses the same DOM through semantic tokens.",
              sourceScenes: SOURCE_SCENES,
              source: <ActivityV2SourcePreview />,
              brutal: <ActivityInboxComposition layout="wide" />,
              elegant: <ActivityInboxComposition layout="wide" />,
              elegantDark: <ActivityInboxComposition layout="wide" />,
              compositionCode: code.composition,
              compositionCollapsedCode: code.compositionBody,
              compositionPath: ACTIVITY_COMPOSITION_PATH,
              compositionSource: activityInboxCompositionSource,
              previewClassName: "items-stretch overflow-hidden p-0",
            },
          ]}
        />
        <ActivitySourceFiles code={code} />
      </DocSection>
    </DocPage>
  );
}

/** Canonical composition plus the Panel-based shell parts it renders. */
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
          source: activityInboxCompositionSource,
          html: code.composition,
          collapsedHtml: code.compositionBody,
        },
        {
          path: ACTIVITY_PARTS_PATH,
          source: activityPanelPartsSource,
          html: code.parts,
          collapsedHtml: code.partsBody,
        },
      ]}
    />
  );
}
