import { tv } from "../../lib/tv";
import { panelHeadActions, panelHeadEdges } from "../panel/panel-header.recipe";

// The composer's footer adds no space above it: the list ends a section step
// over the composer's frame with `pb-timeline-end` under its last row
// (design/foundations/spacing.md#timeline-rhythm), and PanelFooter's own
// 12px would stack on it.
// The root message ends a section step over its rule; the replies start a
// section step under it (`replySummary`).
export const threadPanel = tv({
  slots: {
    root: [
      "isolate flex size-full min-h-0  flex-col",
      "relative bg-layer-canvas font-sans text-foreground",
    ],
    header: [
      "flex h-(--shell-header-height,56px) shrink-0 items-center gap-3 max-md:gap-2",
      panelHeadEdges,
      "border-b border-line-seam bg-layer-canvas",
    ],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col", "relative bg-layer-canvas"],
    title: ["m-0 min-w-0 flex-1 truncate", "font-bold", "font-sans text-headline text-foreground"],
    titleMeta: ["font-normal text-foreground-hint"],
    actions: panelHeadActions,
    search: [
      "relative z-20 flex shrink-0 items-center gap-1.5 py-2",
      "*:data-[slot=input-group]:min-w-0 *:data-[slot=input-group]:flex-1",
      "border-b border-line-hairline bg-layer-canvas px-5",
    ],
    searchTrailing: ["ml-auto flex shrink-0 items-center gap-1.5"],
    searchCount: [
      "shrink-0 whitespace-nowrap font-mono tabular-nums",
      "text-mono-meta text-foreground-hint",
    ],
    originalMessage: [
      "relative shrink-0",
      "border-b border-line-hairline bg-transparent pb-timeline-end",
      "**:data-message-item:bg-transparent",
    ],
    replySummary: ["pt-timeline-start", "px-5"],
    replyCount: [
      "my-timeline-row border-b pb-2 text-center font-mono",
      "border-line-hairline text-mono-meta text-foreground-hint",
    ],
    footer: ["pt-0", "text-caption text-foreground-hint"],
  },
});
