import { tv } from "../../lib/tv";

const headerFrame = ["flex h-[var(--shell-header-height,62px)] shrink-0 items-center gap-2 px-5"];

const brutalHeader = ["gap-3 border-b-2 border-black bg-white"];

const brutalSectionHeader = [
  "max-md:bg-primary-400",
  "[@media(max-height:600px)]:h-[var(--shell-header-height,62px)]",
  "max-md:[&>[data-slot=conversation-panel-header-icon]]:hidden",
  "md:[&>[data-slot=conversation-panel-header-icon]]:size-10",
  "md:[&>[data-slot=conversation-panel-header-icon]]:bg-primary-400",
];

const elegantHeader = [
  "relative isolate h-auto min-h-[var(--shell-header-height,56px)] max-md:z-10 [@media(max-height:600px)]:h-auto",
  "border-b-0 bg-transparent max-md:bg-layer-page",
  "pl-9 max-md:grid max-md:grid-cols-[auto_auto_minmax(0,1fr)_auto]",
  "max-md:h-[var(--shell-header-height,56px)] max-md:items-center max-md:px-[14px]",
];

export const conversationPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col"],
    header: [...headerFrame, "max-md:sticky max-md:top-0 max-md:z-30"],
    sectionHeader: [],
    headerIcon: [
      "flex size-9 shrink-0 items-center justify-center",
      "border-2",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    headerContent: ["min-w-0 flex-1"],
    heading: ["flex min-w-0 items-center gap-2"],
    title: ["truncate text-base font-bold leading-tight"],
    meta: ["min-w-0 truncate font-mono text-xs"],
    status: [
      "inline-flex shrink-0 items-center gap-1",
      "px-1.5 py-1 text-[11px] font-bold uppercase leading-none",
      "[&_svg]:size-[11px] [&_svg]:shrink-0",
      "has-[[data-slot=status]]:border-0 has-[[data-slot=status]]:bg-transparent has-[[data-slot=status]]:p-0",
      "has-[[data-slot=status]]:gap-1.5 has-[[data-slot=status]]:normal-case has-[[data-slot=status]]:text-xs has-[[data-slot=status]]:font-normal",
    ],
    actions: ["flex shrink-0 items-center gap-1.5 max-md:gap-0.5"],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    tabs: ["shrink-0"],
    footer: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: brutalHeader,
        sectionHeader: [
          ...headerFrame,
          ...brutalHeader,
          "max-md:before:hidden",
          ...brutalSectionHeader,
        ],
        headerIcon: "border-black bg-soft-signal text-black",
        headerContent: [
          "flex flex-col",
          "has-[>[data-slot=conversation-panel-header-icon]]:grid has-[>[data-slot=conversation-panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
          "has-[>[data-slot=conversation-panel-header-icon]]:items-center has-[>[data-slot=conversation-panel-header-icon]]:gap-x-3",
          "has-[>[data-slot=conversation-panel-meta]]:[&>[data-slot=conversation-panel-header-icon]]:row-span-2",
          "has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-heading]]:col-start-2",
          "has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-title]]:col-start-2",
          "has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-meta]]:col-start-2",
        ],
        title: "text-black",
        meta: "text-black/50",
        status: "border-2 border-black bg-brutal-orange/25 text-black",
        actions: "max-md:gap-1.5",
        content: "bg-white",
        tabs: [
          "border-b-2 border-black bg-white",
          "[&>[data-slot=tabs-list]]:max-w-none [&>[data-slot=tabs-list]]:border-y-0 [&>[data-slot=tabs-list]]:border-l-0 [&>[data-slot=tabs-list]]:border-r-2 [&>[data-slot=tabs-list]]:border-black [&>[data-slot=tabs-list]]:bg-white",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:bg-white [&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:text-black",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]]:bg-soft-signal [&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]:hover]:bg-soft-signal",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]+[data-slot=tabs-tab]]:before:bg-black",
        ],
        footer: "border-t-2 border-black bg-white",
      },
      elegant: {
        root: "relative bg-layer-page font-sans text-foreground",
        header: elegantHeader,
        sectionHeader: [...headerFrame, ...elegantHeader, "max-md:before:hidden"],
        actions: "max-md:col-start-4 max-md:row-start-1 max-md:self-center",
        headerIcon: [
          "size-auto rounded-none border-0 bg-transparent",
          "text-foreground-muted",
          "[&_svg]:size-3.5 [&_svg]:stroke-[2.5]",
          "max-md:col-start-2 max-md:row-start-1 max-md:self-center",
        ],
        headerContent: [
          "flex flex-col md:flex-row md:items-center md:gap-2",
          "md:has-[>[data-slot=conversation-panel-meta]]:items-baseline",
          "max-md:col-start-3 max-md:row-start-1 max-md:min-w-0 max-md:gap-1 max-md:self-start",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:grid max-md:has-[>[data-slot=conversation-panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:items-center max-md:has-[>[data-slot=conversation-panel-header-icon]]:gap-x-2",
          "max-md:has-[>[data-slot=conversation-panel-meta]]:[&>[data-slot=conversation-panel-header-icon]]:row-span-2",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-heading]]:col-start-2",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-title]]:col-start-2",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-meta]]:col-span-2",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-meta]]:col-start-1",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:col-start-2 max-md:has-[>[data-slot=conversation-panel-header-icon]]:col-span-2",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:self-center",
          "max-md:has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-header-icon]]:col-start-1",
          "md:has-[>[data-slot=conversation-panel-header-icon]]:[&>[data-slot=conversation-panel-header-icon]]:self-center",
        ],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
        ],
        meta: "font-sans leading-none text-foreground-placeholder max-md:leading-tight",
        status: [
          "border-0 bg-transparent p-0",
          "text-foreground-placeholder",
          "[&_svg]:size-[13px]",
        ],
        content: [
          "relative overflow-clip",
          "bg-layer-panel md:shadow-xl",
          "md:ml-2 md:rounded-tl-[10px]",
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
      },
    },
    size: {
      sm: {},
      md: { meta: "text-sm" },
    },
  },
});
