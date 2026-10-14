import { tv } from "../../lib/tv";

export const messageActionCardContent = tv({
  slots: {
    root: ["p-3"],
    panel: [
      "h-(--collapsible-panel-height) overflow-hidden",
      "transition-[height] duration-200 ease-out motion-reduce:transition-none",
      "data-[starting-style]:h-0 data-[ending-style]:h-0",
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
    // the cap shows about two and a half rows so the cut-off says "more".
    scopeListViewport: ["max-h-[172px] overflow-y-auto overscroll-contain"],
    scopeListLabel: [],
    scope: ["min-w-0 border p-1.5"],
    scopeName: ["break-all font-mono text-[11px] font-bold"],
    scopeDescription: ["text-xs leading-snug"],
    // The agent's own reason: a label, then the reason as an italic quote.
    hintLabel: [],
    hint: ["[[data-slot=message-action-card-hint-label]+&]:mt-1"],
    // A standing note from Raft about what the action does or who may run it:
    // one quiet line with a leading icon, no background. The agent's own
    // reason is a hint, not a notice.
    notice: ["mt-3 flex items-start gap-2", "[&>svg]:mt-0.5 [&>svg]:size-3.5 [&>svg]:shrink-0"],
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
        scopeListLabel: "text-xs leading-4 font-normal text-black/55",
        scope: "border-black/15 bg-white",
        scopeName: "text-black/55",
        scopeDescription: "text-black/60",
        hintLabel: "mt-3 text-xs leading-4 text-black/55",
        hint: "mt-1 border-l-2 border-black/20 pl-2 text-xs italic text-black/55",
        notice: "text-xs leading-4 text-black/70",
        completion: "mt-1 text-xs text-black/55",
        scopeListViewport: "space-y-1.5 pr-1",
        actions: "mt-3 gap-3",
        actionsNote: "text-xs text-black/55",
      },
      elegant: {
        root: "px-3.5 pt-2.5 pb-3.5 sm:px-4",
        properties: "mt-2 gap-x-6 gap-y-2",
        propertyLabel: "text-[13px] leading-5 text-foreground-muted/80",
        propertyValue: "text-[13px] leading-5 text-foreground-strong",
        scopeList: "space-y-2",
        scopeListLabel: "text-[13px] leading-5 font-medium text-foreground-strong",
        scope:
          "rounded-md border-line-muted bg-layer-panel/70 px-2.5 py-2 shadow-raft-xs dark:border-transparent dark:bg-fill-muted",
        scopeName: "font-sans text-xs leading-4 font-medium text-foreground-muted",
        scopeDescription: "mt-0.5 text-[13px] leading-5 text-pretty text-foreground-muted/80",
        hintLabel: "mt-3 text-[13px] leading-5 font-medium text-foreground-strong",
        hint: "mt-2.5 border-l border-line-muted pl-2.5 text-xs leading-4 italic text-foreground-muted/80",
        notice: "text-[13px] leading-5 text-foreground-muted [&>svg]:mt-[3px]",
        completion: "mt-2.5 text-[13px] leading-5 text-foreground-muted",
        scopeListViewport: "space-y-2 pr-1",
        actions: "mt-4 gap-2",
        actionsNote: "text-[13px] leading-5 text-foreground-muted",
      },
    },
  },
});
