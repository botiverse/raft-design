import { tv } from "../../lib/tv";

export const chatMainPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col", "text-foreground"],
    header: [
      "flex h-[var(--shell-header-height,62px)] shrink-0 items-center gap-2 px-5",
      "[@media(max-height:600px)]:h-12",
    ],
    // Additive chrome for ChatMainPanelSectionHeader (composed onto `header`).
    sectionHeader: "",
    headerIcon: [
      "flex size-9 shrink-0 items-center justify-center",
      "border-2",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    titleBlock: ["min-w-0 flex-1"],
    titleRow: ["flex min-w-0 items-center gap-2"],
    title: ["truncate text-base font-bold leading-tight"],
    subtitle: ["min-w-0 truncate font-mono text-xs"],
    titleBadge: [
      "inline-flex shrink-0 items-center gap-1 max-md:hidden",
      "px-1.5 py-1 text-[11px] font-bold uppercase leading-none",
      "[&_svg]:size-[11px] [&_svg]:shrink-0",
    ],
    actions: ["flex shrink-0 items-center gap-1.5 max-md:gap-0.5"],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    tabs: ["shrink-0"],
    jumpToLatestLayout: ["absolute bottom-3 left-1/2 z-10 -translate-x-1/2"],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    timeline: [
      "relative h-full overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    messageList: ["flex min-h-full flex-col"],
    footer: [
      "relative flex shrink-0 items-center px-3 max-md:px-1.5 pt-3",
      "pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-md:pb-[calc(env(safe-area-inset-bottom)+6px)]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: "gap-3 border-b-2 border-black bg-white",
        sectionHeader: [
          "max-md:bg-primary-400",
          "[@media(max-height:600px)]:h-[var(--shell-header-height,62px)]",
          "md:[&>[data-slot=chat-main-panel-header-icon]]:size-10",
          "md:[&>[data-slot=chat-main-panel-header-icon]]:bg-primary-400",
        ],
        headerIcon: "border-black bg-soft-signal text-black",
        titleBlock: "flex flex-col",
        title: "text-black",
        subtitle: "text-black/50",
        titleBadge: "border-2 border-black bg-brutal-orange/25 text-black",
        content: "bg-white",
        tabs: [
          "border-b-2 border-black bg-white",
          "[&>[data-slot=tabs-list]]:max-w-none [&>[data-slot=tabs-list]]:border-y-0 [&>[data-slot=tabs-list]]:border-l-0 [&>[data-slot=tabs-list]]:border-r-2 [&>[data-slot=tabs-list]]:border-black [&>[data-slot=tabs-list]]:bg-white",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:bg-white [&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:text-black",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]]:bg-soft-signal [&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]:hover]:bg-soft-signal",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]+[data-slot=tabs-tab]]:before:bg-black",
        ],
        body: "bg-white",
        timeline: "bg-white",
        footer: "border-t-2 border-black bg-white",
      },
      elegant: {
        root: "relative bg-layer-page font-sans text-foreground",
        header: [
          "relative isolate h-auto min-h-[var(--shell-header-height,3.5rem)] [@media(max-height:600px)]:h-auto",
          "border-b-0 bg-transparent max-md:bg-layer-page",
          "pl-9 max-md:grid max-md:grid-cols-[auto_auto_minmax(0,1fr)_auto]",
          "max-md:items-start max-md:px-[14px] max-md:pt-3",
        ],
        actions: "max-md:col-start-4 max-md:row-start-1 max-md:self-start",
        headerIcon: [
          "size-auto rounded-none border-0 bg-transparent",
          "text-foreground-muted",
          "[&_svg]:size-3.5 [&_svg]:stroke-[2.5]",
          "max-md:col-start-2 max-md:row-start-1 max-md:h-[calc(1.0625rem*1.25)]",
        ],
        titleBlock: [
          "flex flex-col md:flex-row md:items-baseline md:gap-2",
          "max-md:col-start-3 max-md:row-start-1 max-md:min-w-0 max-md:gap-1",
        ],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
          "max-md:leading-none",
        ],
        subtitle: [
          "font-sans leading-none text-foreground-placeholder",
          "max-md:-ml-[calc(0.875rem+0.5rem)]",
        ],
        titleBadge: [
          "border-0 bg-transparent p-0",
          "text-foreground-placeholder",
          "[&_svg]:size-[13px]",
        ],
        content: [
          "relative overflow-clip",
          "bg-[var(--shell-surface-bg,var(--layer-panel))] shadow-xl",
          "md:ml-2 md:rounded-tl-[var(--shell-surface-radius,10px)]",
        ],
        tabs: [
          "border-b-0 bg-layer-panel max-md:bg-layer-page",
          "max-md:border-b max-md:border-line-subtle",
          "[&>[data-slot=tabs-list]]:border-b-0",
          "[&>[data-slot=tabs-list]]:max-md:h-10",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:max-md:h-10",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:max-md:py-2",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:bg-primary-400",
          "max-md:[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:h-px",
        ],
        body: "bg-[var(--shell-surface-bg,var(--layer-panel))]",
        timeline: "bg-[var(--shell-surface-bg,var(--layer-panel))]",
        footer: [
          "max-md:px-2.5 md:px-7 pt-3",
          "max-md:pb-[calc(env(safe-area-inset-bottom)+0.625rem)] md:pb-[calc(env(safe-area-inset-bottom)+1.75rem)]",
          "border-t-0",
          "bg-[var(--shell-surface-bg,var(--layer-panel))]",
        ],
      },
    },
  },
});
