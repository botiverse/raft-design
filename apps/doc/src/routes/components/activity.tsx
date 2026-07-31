import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ActivityInboxComposition } from "#/modules/activity/compositions/activity-inbox.composition.tsx";
import activityInboxCompositionSource from "#/modules/activity/compositions/activity-inbox.composition.tsx?raw";
import { CompactActivityComposition } from "#/modules/activity/compositions/compact-activity.composition.tsx";
import compactActivitySource from "#/modules/activity/compositions/compact-activity.composition.tsx?raw";
import { DoneActivityComposition } from "#/modules/activity/compositions/done-activity.composition.tsx";
import doneActivitySource from "#/modules/activity/compositions/done-activity.composition.tsx?raw";
import { EmptyActivityComposition } from "#/modules/activity/compositions/empty-activity.composition.tsx";
import emptyActivitySource from "#/modules/activity/compositions/empty-activity.composition.tsx?raw";
import { LoadingActivityComposition } from "#/modules/activity/compositions/loading-activity.composition.tsx";
import loadingActivitySource from "#/modules/activity/compositions/loading-activity.composition.tsx?raw";
import { LoadingMoreActivityComposition } from "#/modules/activity/compositions/loading-more-activity.composition.tsx";
import loadingMoreActivitySource from "#/modules/activity/compositions/loading-more-activity.composition.tsx?raw";
import { SavedActivityComposition } from "#/modules/activity/compositions/saved-activity.composition.tsx";
import savedActivitySource from "#/modules/activity/compositions/saved-activity.composition.tsx?raw";
import { ActivityV2SourcePreview } from "../../../../../packages/ui/source/activity/ActivityV2SourcePreview.tsx";
import activityV2Source from "../../../../../packages/ui/source/activity/ActivityV2SourcePreview.tsx?raw";

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

const ACTIVITY_PARTS = [
  "Root",
  "Header",
  "HeaderBack",
  "HeaderIcon",
  "HeaderContent",
  "HeaderHeading",
  "HeaderTitle",
  "HeaderSubtitle",
  "Layout",
  "Sidebar",
  "SidebarSection",
  "SidebarHeading",
  "SidebarHeadingLabel",
  "NavigationItem",
  "NavigationLabel",
  "NavigationCount",
  "Main",
  "Controls",
  "MobileNavigation",
  "MobileNavigationButton",
  "MobileNavigationLabel",
  "ControlsFilter",
  "Search",
  "SearchIcon",
  "SearchInput",
  "SearchClear",
  "SelectionToolbar",
  "SelectionCount",
  "ToolbarButton",
  "ToolbarPrimaryAction",
  "ToolbarLink",
  "SortTrigger",
  "Switcher",
  "SwitcherTrigger",
  "SwitcherContent",
  "SwitcherHeader",
  "SwitcherTitle",
  "SwitcherClose",
  "SwitcherBody",
  "SwitcherItem",
  "SwitcherItemLabel",
  "SwitcherItemCount",
  "SwitcherSeparator",
  "Viewport",
  "List",
  "Item",
  "ItemOpen",
  "ItemSelection",
  "ItemContent",
  "ItemSubtitle",
  "ItemHeading",
  "ItemTitle",
  "ItemTitleIcon",
  "ItemTimestamp",
  "ItemBody",
  "ItemSender",
  "ItemMetadata",
  "ItemActions",
  "ItemAction",
  "ItemSavedAction",
] as const;

const ACTIVITY_PART_ROWS: readonly PropRow[] = ACTIVITY_PARTS.map((part) => ({
  name: `ActivityInbox${part}`,
  type: `ActivityInbox${part}Props`,
  description: activityPartDescription(part),
}));

const STATE_EXAMPLES = [
  { label: "Saved", preview: <SavedActivityComposition />, code: "saved" },
  { label: "Done", preview: <DoneActivityComposition />, code: "done" },
  { label: "Compact", preview: <CompactActivityComposition />, code: "compact" },
  { label: "Empty", preview: <EmptyActivityComposition />, code: "empty" },
  { label: "Initial loading", preview: <LoadingActivityComposition />, code: "loading" },
  {
    label: "Loading more",
    preview: <LoadingMoreActivityComposition />,
    code: "loadingMore",
  },
] as const;

export const Route = createFileRoute("/components/activity")({
  component: ActivityDoc,
  loader: () =>
    highlightSnippets({
      data: {
        composition: activityInboxCompositionSource,
        source: activityV2Source,
        saved: savedActivitySource,
        done: doneActivitySource,
        compact: compactActivitySource,
        empty: emptyActivitySource,
        loading: loadingActivitySource,
        loadingMore: loadingMoreActivitySource,
      },
    }),
});

function ActivityDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ActivityInbox"
      description="Source-aligned Activity inbox parts and an executable composition for Active, Saved, and Done workflows."
      overview={
        <ul className="list-disc space-y-1 pl-4">
          <li>
            preserves the source Activity v2 Brutal spacing, borders, shadows, and selected
            treatments
          </li>
          <li>
            keeps stores, transport, routing, analytics, feature flags, and product workflow state
            in the consumer
          </li>
          <li>
            uses the current raft-ui font stack; no Activity-specific Elegant recipe is authored
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
              sourceCode: code.source,
              brutalCode: code.composition,
              compositionCode: code.composition,
              compositionCollapsedCode: code.compositionBody,
              compositionPath:
                "apps/doc/src/modules/activity/compositions/activity-inbox.composition.tsx",
              compositionSource: activityInboxCompositionSource,
              previewClassName: "items-stretch overflow-hidden p-0",
            },
          ]}
        />
      </DocSection>

      <DocSection id="states" title="Activity states">
        <div className="grid gap-8">
          {STATE_EXAMPLES.map((example) => (
            <div key={example.label} className="grid gap-3">
              <h3 className="text-sm font-medium text-foreground-strong">{example.label}</h3>
              <Preview
                previewClassName={
                  example.code === "compact"
                    ? "h-[42rem] max-w-md items-stretch overflow-hidden p-0"
                    : "h-[42rem] items-stretch overflow-hidden p-0"
                }
                previewInset="flush"
                previewTheme="brutal"
              >
                <Preview.Canvas>{example.preview}</Preview.Canvas>
                <Preview.Code
                  html={code[example.code]}
                  collapsedHtml={code[`${example.code}Body`]}
                />
              </Preview>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={ACTIVITY_PART_ROWS} nameColumnLabel="Export" />
      </DocSection>

      <DocSection id="ownership" title="Ownership">
        <div className="prose prose-sm max-w-none text-foreground-muted">
          <p>
            <code>packages/ui</code> owns only the Activity visual parts and the keyboard behavior
            for nested selection/action controls. The docs composition owns deterministic example
            state and visible product copy.
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

function activityPartDescription(part: (typeof ACTIVITY_PARTS)[number]): string {
  if (part.startsWith("Item")) {
    return `Activity row ${part.replace(/^Item/, "").toLocaleLowerCase() || "root"} part. Visible content stays consumer-owned.`;
  }
  if (part.startsWith("Header")) {
    return `Source-aligned panel header ${part.replace(/^Header/, "").toLocaleLowerCase() || "root"} part.`;
  }
  if (part.startsWith("Navigation") || part.startsWith("Sidebar")) {
    return `Activity navigation ${part.toLocaleLowerCase()} part. Selection is expressed with native ARIA state.`;
  }
  return `Activity inbox ${part.toLocaleLowerCase()} part with native element props and render substitution.`;
}
