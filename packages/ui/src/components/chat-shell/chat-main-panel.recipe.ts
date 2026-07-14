import { tv } from "../../lib/tv";

export const chatMainPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col", "text-foreground"],
    header: ["flex h-[62px] shrink-0 items-center gap-2 px-5", "[@media(max-height:600px)]:h-12"],
    headerMask: ["pointer-events-none absolute inset-x-0 top-0 -z-10 hidden"],
    headerMaskLayer: ["absolute inset-x-0 top-0"],
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
      "inline-flex shrink-0 items-center gap-1",
      "px-1.5 py-1 text-[11px] font-bold uppercase leading-none",
      "[&_svg]:size-[11px] [&_svg]:shrink-0",
    ],
    actions: ["flex shrink-0 items-center gap-1.5"],
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
      "relative flex shrink-0 items-center px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: "gap-3 border-b-2 border-black bg-white",
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
          "border-b-0 bg-transparent",
          "pl-9",
          "max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:z-20 max-md:pl-5",
        ],
        headerMask: ["max-md:block h-[calc(100%+1.5rem)]"],
        headerMaskLayer: [
          "h-full",
          "data-[layer=solid]:bg-[linear-gradient(to_bottom,var(--shell-surface-bg,var(--layer-panel))_0%,var(--shell-surface-bg,var(--layer-panel))_28%,color-mix(in_oklch,var(--shell-surface-bg,var(--layer-panel))_82%,transparent)_52%,transparent_100%)]",
          "data-[layer=soft]:h-[108%] data-[layer=soft]:bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--shell-surface-bg,var(--layer-panel))_48%,transparent)_0%,color-mix(in_oklch,var(--shell-surface-bg,var(--layer-panel))_18%,transparent)_40%,transparent_100%)]",
          "data-[layer=blur]:h-[112%] data-[layer=blur]:backdrop-blur-[14px] data-[layer=blur]:backdrop-saturate-125",
          "data-[layer=blur]:[mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
          "data-[layer=blur]:[-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
        ],
        headerIcon: [
          "size-auto rounded-none border-0 bg-transparent",
          "text-foreground-muted",
          "[&_svg]:size-3.5 [&_svg]:stroke-[2.5]",
        ],
        titleBlock: ["flex items-baseline gap-2"],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
        ],
        subtitle: "font-sans text-foreground-placeholder",
        titleBadge: [
          "border-0 bg-transparent p-0",
          "text-foreground-placeholder",
          "[&_svg]:size-[13px]",
        ],
        content: [
          "relative overflow-clip md:ml-2 md:rounded-tl-[var(--shell-surface-radius,10px)]",
          "bg-[var(--shell-surface-bg,var(--layer-panel))] shadow-xl",
          "max-md:pt-[var(--shell-header-height,3.5rem)]",
        ],
        tabs: [
          "border-b-0 bg-layer-panel",
          "[&>[data-slot=tabs-list]]:border-b-0",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:bg-primary-400",
        ],
        body: "bg-[var(--shell-surface-bg,var(--layer-panel))]",
        timeline: "bg-[var(--shell-surface-bg,var(--layer-panel))]",
        footer: [
          "pl-7 pr-7 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]",
          "border-t-0",
          "bg-[var(--shell-surface-bg,var(--layer-panel))]",
        ],
      },
    },
    subtitleSize: {
      sm: {},
      md: {
        subtitle: "text-sm",
      },
    },
    headerMode: {
      default: {},
      section: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      headerMode: "section",
      class: {
        header: [
          "max-md:bg-primary-400",
          "[@media(max-height:600px)]:h-[62px]",
          "max-md:[&>[data-slot=chat-main-panel-header-icon]]:hidden",
          "md:[&>[data-slot=chat-main-panel-header-icon]]:size-10",
          "md:[&>[data-slot=chat-main-panel-header-icon]]:bg-primary-400",
        ],
      },
    },
  ],
  defaultVariants: {
    headerMode: "default",
  },
});
