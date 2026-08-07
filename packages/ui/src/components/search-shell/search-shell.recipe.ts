import { tv } from "../../lib/tv";

const brutalButton = [
  "border-2 border-black font-heading font-bold shadow-raft-sm",
  "transition-all duration-100 hover:-translate-y-px hover:shadow-raft-md",
  "active:translate-x-px active:translate-y-px active:shadow-raft-xs",
  "disabled:shadow-raft-sm",
];

const disabledButton =
  "disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50";

export const searchShell = tv({
  slots: {
    frame: "flex h-full min-h-0 flex-1 flex-col",
    header: "flex items-center gap-3",
    content: "relative flex min-h-0 min-w-0 flex-1 flex-col",
    headerBack: [
      "inline-flex size-7 shrink-0 items-center justify-center leading-none md:hidden",
      disabledButton,
    ],
    headerIconChip: "flex size-9 shrink-0 items-center justify-center",
    searchInputGroup: "flex-1",
    input: "",
    filterInput: "text-xs",
    inputClear: disabledButton,
    inputKbd: "hidden text-[10px] sm:inline",
    filtersRow: "shrink-0 px-4 py-3",
    channelActiveChip: ["inline-flex items-center gap-2 px-3 py-1.5 text-xs", disabledButton],
    channelOptionIcon: "",
    clearAllButton: ["inline-flex items-center gap-2 px-2.5 py-1 text-[11px]", disabledButton],
    resultsViewport: "min-h-0 flex-1 overflow-y-auto",
    resultsContent: "p-4",
    loadMoreButton: ["px-4 py-1.5 text-xs", disabledButton],
    entityIconChannel: "flex size-8 items-center justify-center overflow-hidden",
    entityIconComputer: "flex size-8 items-center justify-center overflow-hidden",
    entityIconArchived: "flex size-8 items-center justify-center overflow-hidden",
    activityDot: "absolute -right-0.5 -bottom-0.5 inline-block size-2.5 shrink-0 rounded-full",
    skeletonCard: "p-3",
  },
  variants: {
    theme: {
      brutal: {
        frame: "bg-white",
        header: [
          "h-[62px] px-5 border-b-2 border-black bg-white",
          "[@media(max-height:600px)]:!h-[62px]",
        ],
        headerBack: ["bg-white text-black", brutalButton],
        headerIconChip: "border-2 border-black bg-soft-signal",
        content: "bg-white",
        searchInputGroup: [
          "shadow-sm",
          "has-[[data-slot=input-group-control]:focus]:not-has-[[data-slot=input-group-control][data-invalid]]:shadow-md",
        ],
        input: "font-heading font-medium placeholder:text-black/40",
        inputClear: ["bg-white p-1", brutalButton],
        inputKbd: "font-bold uppercase text-black/50",
        filtersRow: "border-b-2 border-black bg-white",
        channelActiveChip: "border-2 border-black bg-primary-400 font-bold text-black shadow-sm",
        channelOptionIcon: "text-black/50",
        clearAllButton: "border border-black bg-white font-bold text-black/60 hover:text-black",
        resultsViewport: "bg-white",
        resultsContent: "bg-white",
        loadMoreButton: ["bg-white", brutalButton],
        entityIconChannel: "border-2 border-black bg-primary-400 text-black",
        entityIconComputer: "border-2 border-black bg-brutal-lime",
        entityIconArchived: "border-2 border-black/40 bg-black/5 text-black/45",
        activityDot: "border border-black bg-brutal-lime",
        skeletonCard: "border-2 border-black/30 bg-white",
      },
      elegant: {
        frame: "bg-layer-canvas-muted dark:bg-layer-canvas-muted",
        header: [
          "min-h-[var(--shell-header-height,56px)]",
          "max-md:h-[var(--shell-header-height,56px)] max-md:bg-layer-canvas-muted dark:bg-layer-canvas-muted",
          "max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
        ],
        headerBack: [
          "rounded-md border border-line-field bg-layer-panel text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-layer-card dark:hover:bg-fill-muted",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        headerIconChip: "rounded-md bg-fill-muted text-foreground-icon",
        searchInputGroup: "dark:bg-layer-card",
        input: "font-sans text-foreground-strong placeholder:text-foreground-placeholder/70",
        inputClear: [
          "rounded-sm p-1 text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:hover:bg-fill-muted dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        inputKbd: "text-foreground-muted",
        filtersRow: [
          "border-b border-line-muted bg-layer-panel",
          "px-7 max-md:pl-5 max-md:pr-3.5",
          "dark:bg-transparent",
        ],
        channelActiveChip: [
          "rounded-md border border-line-hairline bg-fill-muted font-medium text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-fill-muted dark:hover:bg-fill-strong",
        ],
        channelOptionIcon: "text-foreground-icon",
        clearAllButton: [
          "rounded-md border-0 font-medium text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        resultsViewport: "bg-layer-panel dark:bg-transparent",
        resultsContent: ["bg-layer-panel dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
        loadMoreButton: [
          "rounded-md border border-line-field bg-layer-panel font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-layer-card dark:shadow-raft-xs dark:hover:bg-fill-muted",
        ],
        entityIconChannel: "rounded-md bg-fill-muted text-foreground-icon",
        entityIconComputer: "rounded-md bg-fill-muted text-foreground-icon",
        entityIconArchived: "rounded-md bg-fill-muted text-foreground-disabled",
        activityDot: "border border-layer-panel bg-brutal-lime dark:bg-success",
        skeletonCard: [
          "rounded-lg border-[0.5px] border-line-hairline bg-[oklch(0.985_0.003_84.559)] shadow-xs",
          "dark:border-transparent dark:bg-layer-card dark:shadow-raft-xs",
        ],
      },
    },
  },
});
