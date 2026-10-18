import { tv } from "../../lib/tv";
import { panelHeadActions, panelHeadEdges } from "../panel/panel-header.recipe";

export const threadPanel = tv({
  slots: {
    root: [
      "isolate flex size-full min-h-0  flex-col",
      "relative bg-layer-panel font-sans text-foreground",
    ],
    header: [
      "flex h-(--shell-header-height,56px) shrink-0 items-center gap-3 max-md:gap-2",
      panelHeadEdges,
      "border-b border-line-seam bg-layer-panel",
    ],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col", "relative bg-layer-panel"],
    title: ["m-0 min-w-0 flex-1 truncate", "font-bold", "font-sans text-headline text-foreground"],
    titleMeta: ["font-normal text-foreground-hint"],
    actions: panelHeadActions,
    search: [
      "relative z-20 flex shrink-0 items-center gap-1.5 py-2",
      "[&>[data-slot=input-group]]:min-w-0 *:data-[slot=input-group]:flex-1",
      "border-b border-line-muted bg-layer-panel px-5",
    ],
    searchTrailing: ["ml-auto flex shrink-0 items-center gap-1.5"],
    searchCount: [
      "shrink-0 whitespace-nowrap font-mono tabular-nums",
      "text-mono-meta text-foreground-hint",
    ],
    originalMessage: [
      "relative shrink-0",
      "border-b border-line-muted bg-transparent pb-2",
      "**:data-message-item:bg-transparent",
    ],
    replySummary: ["pt-2", "px-5"],
    replyCount: [
      "mb-1 border-b pb-2 text-center font-mono",
      "border-line-muted text-mono-meta text-foreground-hint",
    ],
    footer: ["text-caption text-foreground-hint"],
  },
});
