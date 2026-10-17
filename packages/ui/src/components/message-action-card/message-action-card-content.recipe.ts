import { tv } from "../../lib/tv";

export const messageActionCardContent = tv({
  slots: {
    root: ["p-3"],
    panel: [
      "h-(--collapsible-panel-height) overflow-hidden",
      "transition-[height] duration-200 ease-out motion-reduce:transition-none",
      "data-starting-style:h-0 data-ending-style:h-0",
    ],
    properties: [
      "m-0 grid grid-cols-[max-content_minmax(0,1fr)] items-baseline",
      "max-sm:grid-cols-1 max-sm:gap-y-0.5",
    ],
    property: ["contents"],
    propertyLabel: ["max-w-40 min-w-0 wrap-break-word"],
    propertyValue: ["m-0 min-w-0 wrap-break-word"],
    scopeList: ["mt-3 space-y-1.5"],
    // A long permission list scrolls inside the card instead of stretching it;
    // the cap cuts through the third row so the cut-off says "more" (Brutal
    // rows are shorter, so its cap is lower).
    scopeListViewport: ["overflow-y-auto overscroll-contain"],
    scopeListLabel: [],
    scope: ["min-w-0 border p-1.5"],
    scopeName: ["break-all font-mono text-[11px] font-bold"],
    scopeDescription: ["text-xs/snug "],
    // The agent's own reason: a label, then the reason as an italic quote.
    hintLabel: [],
    hint: ["[[data-slot=message-action-card-hint-label]+&]:mt-1"],
    // A standing note from Raft about what the action does or who may run it.
    // It leads the content, before the properties, as a tinted block with a
    // leading icon. The agent's own reason is a hint, not a notice.
    notice: ["mb-3 flex items-start gap-2", "[&>svg]:size-3.5 [&>svg]:shrink-0"],
    completion: [],
    // Actions sit bottom-right; an optional note (state, who resolved it)
    // takes the space on the left.
    actions: ["flex flex-wrap items-center justify-end"],
    actionsNote: ["min-w-0 flex-1 basis-40"],
  },
  variants: {
    theme: {
      brutal: {
        root: "pt-2.5",
        properties: "mt-1 gap-x-3 gap-y-1",
        propertyLabel: "text-xs text-black/55",
        propertyValue: "text-xs text-black/75",
        scopeListLabel: "text-xs/4  font-normal text-black/55",
        scope: "border-black/15 bg-white",
        scopeName: "text-black/55",
        scopeDescription: "text-black/60",
        hintLabel: "mt-3 text-xs/4  text-black/55",
        hint: "mt-1 border-l-2 border-black/20 pl-2 text-xs italic text-black/55",
        notice:
          "border border-black/15 bg-layer-inset px-2.5 py-2 text-xs/4  text-black/55 [&>svg]:mt-px",
        completion: "mt-1 text-xs text-black/55",
        scopeListViewport: "max-h-[132px] space-y-1.5 pr-1",
        actions: "mt-3 gap-3",
        actionsNote: "text-xs text-black/80",
      },
      elegant: {
        root: "px-3.5 pt-2.5 pb-3.5 sm:px-4",
        properties: "mt-2 gap-x-6 gap-y-2",
        propertyLabel: "text-[13px]/5  text-foreground-muted/80",
        propertyValue: "text-[13px]/5  text-foreground-strong",
        scopeList: "space-y-2",
        scopeListLabel: "text-[13px]/5  text-foreground-muted/80",
        scope:
          "rounded-md border-line-muted bg-layer-panel/70 px-2.5 py-2 shadow-raft-xs dark:border-transparent dark:bg-fill-muted",
        scopeName: "font-sans text-xs/4  font-medium text-foreground-muted",
        scopeDescription: "mt-0.5 text-[13px]/5  text-pretty text-foreground-muted/80",
        hintLabel: "mt-3 text-[13px]/5  text-foreground-muted/80",
        hint: "mt-2.5 border-l border-line-muted pl-2.5 text-xs/4  italic text-foreground-muted/80",
        notice:
          "rounded-md bg-fill-muted px-2.5 py-2 text-[13px]/5  text-foreground-muted [&>svg]:mt-[2px]",
        completion: "mt-2.5 text-[13px]/5  text-foreground-muted",
        scopeListViewport: "max-h-[172px] space-y-2 pr-1",
        actions: "mt-4 gap-2",
        actionsNote: "text-[13px]/5  text-foreground-strong",
      },
      raft: {
        root: "flex flex-col gap-2 px-3 pt-0 pb-3",
        properties: [
          "grid-cols-[minmax(88px,max-content)_minmax(0,1fr)] items-center gap-x-4 gap-y-0.5",
        ],
        propertyLabel: "text-footnote font-medium text-foreground-hint",
        propertyValue: "min-h-8 py-1.5 text-callout text-foreground",
        scopeList: "mt-0 space-y-1.5",
        scopeListLabel: "text-footnote font-medium text-foreground-hint",
        scopeListViewport: "max-h-[164px] space-y-1.5 pr-1",
        scope: "rounded-control border-line-muted bg-layer-card px-2.5 py-2",
        scopeName: "text-mono-meta font-normal text-foreground",
        scopeDescription: "mt-0.5 text-footnote text-pretty text-foreground-muted",
        hintLabel: "text-footnote font-medium text-foreground-hint",
        hint: [
          "border-l-2 border-line-seam pl-2.5",
          "text-footnote text-foreground-muted",
          "[[data-slot=message-action-card-hint-label]+&]:-mt-1",
        ],
        notice: [
          "mb-0 rounded-control bg-fill-muted px-2.5 py-2",
          "text-footnote text-foreground-muted",
          "[&>svg]:mt-0.5 [&>svg]:text-foreground-icon",
        ],
        completion: [
          "inline-flex items-center gap-1.5 text-footnote text-foreground-muted",
          "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-foreground",
        ],
        actions: "mt-1 gap-2",
        actionsNote: "text-footnote text-foreground-muted",
      },
    },
  },
});
