import { tv } from "../../lib/tv";

export const messageActionCardContent = tv({
  slots: {
    root: ["p-3", "flex flex-col gap-2 px-3 pt-0 pb-3"],
    panel: [
      "h-(--collapsible-panel-height) overflow-hidden",
      "transition-[height] duration-200 ease-out motion-reduce:transition-none",
      "data-starting-style:h-0 data-ending-style:h-0",
    ],
    properties: [
      "m-0 grid",
      "max-sm:grid-cols-1 max-sm:gap-y-0.5",
      "grid-cols-[minmax(88px,max-content)_minmax(0,1fr)] items-baseline gap-x-4 gap-y-0.5",
    ],
    property: ["contents"],
    propertyLabel: [
      "max-w-40 min-w-0 wrap-break-word",
      "text-footnote font-medium text-foreground-hint",
    ],
    propertyValue: ["m-0 min-w-0 wrap-break-word", "min-h-8 py-1.5 text-callout text-foreground"],
    scopeList: ["mt-0 stack-y-1.5"],
    // A long permission list scrolls inside the card instead of stretching it;
    // the cap cuts through the third row so the cut-off says "more".
    scopeListViewport: ["overflow-y-auto overscroll-contain", "max-h-[164px] stack-y-1.5 pr-1"],
    scopeListLabel: ["text-footnote font-medium text-foreground-hint"],
    scope: [
      "min-w-0 border p-1.5",
      "rounded-control border-line-hairline bg-layer-card px-2.5 py-2",
    ],
    scopeName: ["break-all font-mono", "text-mono-meta font-normal text-foreground"],
    scopeDescription: ["mt-0.5 text-footnote text-pretty text-foreground-muted"],
    // The agent's own reason: a label, then the reason as an italic quote.
    hintLabel: ["text-footnote font-medium text-foreground-hint"],
    hint: [
      "border-l-2 border-line-seam pl-2.5",
      "text-footnote text-foreground-muted",
      "[[data-slot=message-action-card-hint-label]+&]:-mt-1",
    ],
    // A standing note from Raft about what the action does or who may run it.
    // It leads the content, before the properties, as a tinted block with a
    // leading icon. The agent's own reason is a hint, not a notice.
    notice: [
      "flex items-start gap-2",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
      "mb-0 rounded-control bg-fill-muted px-2.5 py-2",
      "text-footnote text-foreground-muted",
      "[&>svg]:mt-[calc((1lh-14px)/2)] [&>svg]:text-foreground-muted",
    ],
    completion: [
      "inline-flex items-center gap-1.5 text-footnote text-foreground-muted",
      "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-foreground",
    ],
    // Actions sit bottom-right; an optional note (state, who resolved it)
    // takes the space on the left.
    actions: ["flex flex-wrap items-center justify-end", "mt-1 gap-2"],
    actionsNote: ["min-w-0 flex-1 basis-40", "text-footnote text-foreground-muted"],
  },
});
