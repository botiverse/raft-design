import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
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
  { id: "source-comparison", title: "Source comparison" },
  { id: "states", title: "Activity states" },
  { id: "api", title: "API" },
  { id: "ownership", title: "Ownership" },
] as const;

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

const ACTIVITY_ITEM_PART_ROWS: readonly PropRow[] = [
  {
    name: "ActivityInboxList",
    type: "ActivityInboxListProps",
    description: "Vertical stack layout for activity row cards.",
  },
  {
    name: "ActivityInboxItem",
    type: "ActivityInboxItemProps",
    description:
      "Activity row card frame. data-unread drives the unread emphasis and data-active drives the opened treatment.",
  },
  {
    name: "ActivityInboxItemOpen",
    type: "ActivityInboxItemOpenProps",
    description:
      "Full-card open target layered behind the content so selection and actions stay independently interactive.",
  },
  {
    name: "ActivityInboxItemSelection",
    type: "ActivityInboxItemSelectionProps",
    description:
      "Checkbox-role selection control with checked and onCheckedChange; stops propagation to the open target.",
  },
  {
    name: "ActivityInboxItemContent",
    type: "ActivityInboxItemContentProps",
    description: "Text column between the selection control and the action cluster.",
  },
  {
    name: "ActivityInboxItemSubtitle",
    type: "ActivityInboxItemSubtitleProps",
    description: "Channel line rendered above the title on thread rows.",
  },
  {
    name: "ActivityInboxItemHeading",
    type: "ActivityInboxItemHeadingProps",
    description: "Row pairing the clamped title with the timestamp.",
  },
  {
    name: "ActivityInboxItemTitle",
    type: "ActivityInboxItemTitleProps",
    description: "Two-line clamped title; unread emphasis comes from the card's data-unread state.",
  },
  {
    name: "ActivityInboxItemTitleIcon",
    type: "ActivityInboxItemTitleIconProps",
    description: "Decorative inline icon before the title text; hidden from assistive technology.",
  },
  {
    name: "ActivityInboxItemTimestamp",
    type: "ActivityInboxItemTimestampProps",
    description: "Right-aligned monospace timestamp.",
  },
  {
    name: "ActivityInboxItemBody",
    type: "ActivityInboxItemBodyProps",
    description: "Two-line clamped message preview.",
  },
  {
    name: "ActivityInboxItemSender",
    type: "ActivityInboxItemSenderProps",
    description: "Bold sender prefix inside the body preview.",
  },
  {
    name: "ActivityInboxItemMetadata",
    type: "ActivityInboxItemMetadataProps",
    description: "Badge row under the body for replies, mentions, unread counts, and drafts.",
  },
  {
    name: "ActivityInboxItemActions",
    type: "ActivityInboxItemActionsProps",
    description: "Action cluster on the right edge of the card.",
  },
  {
    name: "ActivityInboxItemAction",
    type: "ActivityInboxItemActionProps",
    description: "Square bordered card action button (save, done, restore).",
  },
  {
    name: "ActivityInboxItemSavedAction",
    type: "ActivityInboxItemSavedActionProps",
    description: "Saved-state variant of the card action with the orange saved treatment.",
  },
  {
    name: "ActivityInboxItemMenuContent",
    type: "ActivityInboxItemMenuContentProps",
    description: "ContextMenuContent styled for activity row context menus.",
  },
  {
    name: "ActivityInboxItemMenuItem",
    type: "ActivityInboxItemMenuItemProps",
    description: "ContextMenuItem styled for activity row context menus.",
  },
];

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
  loader: () =>
    highlightSnippets({
      data: {
        composition: activityInboxCompositionSource,
        parts: activityPanelPartsSource,
      },
    }),
});

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
      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              label: "Activity v2 inbox",
              status: "difference",
              note: "Brutal preserves the source visual class contract while replacing the source row's nested interactive markup with pixel-neutral sibling buttons. The composition replaces source stores and API calls with deterministic local state. Existing Badge and SegmentedControl primitives are retained because the source already consumes raft-ui. No Activity-specific Elegant recipe is authored.",
              sourceScenes: SOURCE_SCENES,
              source: <ActivityV2SourcePreview />,
              brutal: <ActivityInboxComposition layout="wide" />,
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

      <DocSection id="states" title="Activity states">
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
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={ACTIVITY_ITEM_PART_ROWS} nameColumnLabel="Export" />
      </DocSection>

      <DocSection id="ownership" title="Ownership">
        <div className="prose prose-sm max-w-none text-foreground-muted">
          <p>
            <code>packages/ui</code> owns the activity row card parts and the keyboard behavior for
            the nested open/selection/action controls. The docs module owns the inbox shell,
            composed from the generic <code>Panel</code> container plus local panel parts, and the
            deterministic example state.
          </p>
          <p>
            Production and Playground consumers own item unions, read/save/done policy, server
            synchronization, search and sort persistence, navigation, master/detail coordination,
            analytics, and unread attention counts.
          </p>
        </div>
      </DocSection>
    </DocPage>
  );
}

/** Canonical composition plus the Panel-based shell parts it renders. */
function ActivitySourceFiles({ code }: { code: Record<string, string> }) {
  return (
    <DocsCodeBlock.Files
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
