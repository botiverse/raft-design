import { tv } from "../../lib/tv";

const headerMaskLayers = [
  "data-[layer=solid]:bg-[linear-gradient(to_bottom,var(--layer-page)_0%,var(--layer-page)_28%,color-mix(in_oklch,var(--layer-page)_82%,transparent)_52%,transparent_100%)]",
  "data-[layer=soft]:h-[108%] data-[layer=soft]:bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--layer-page)_48%,transparent)_0%,color-mix(in_oklch,var(--layer-page)_18%,transparent)_40%,transparent_100%)]",
  "data-[layer=blur]:h-[112%] data-[layer=blur]:backdrop-blur-[14px] data-[layer=blur]:backdrop-saturate-125",
  "data-[layer=blur]:[mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
  "data-[layer=blur]:[-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
];

const liveActivityFadeOverlay = [
  "has-[_[data-slot=live-agent-activity-bar]]:before:pointer-events-none has-[_[data-slot=live-agent-activity-bar]]:before:absolute has-[_[data-slot=live-agent-activity-bar]]:before:inset-x-0 has-[_[data-slot=live-agent-activity-bar]]:before:-bottom-3 has-[_[data-slot=live-agent-activity-bar]]:before:z-0 has-[_[data-slot=live-agent-activity-bar]]:before:h-20",
  "has-[_[data-slot=live-agent-activity-bar]]:before:bg-[linear-gradient(to_bottom,transparent,var(--layer-page))] has-[_[data-slot=live-agent-activity-bar]]:before:backdrop-blur-[4px]",
  "has-[_[data-slot=live-agent-activity-bar]]:before:[mask-image:linear-gradient(to_top,black_50%,transparent)]",
  "has-[_[data-slot=live-agent-activity-bar]]:before:[-webkit-mask-image:linear-gradient(to_top,black_50%,transparent)]",
  "has-[_[data-slot=live-agent-activity-bar]]:before:content-['']",
];

export const chatSidebar = tv({
  slots: {
    sidebarRoot: [
      "relative flex h-full min-h-0 w-full select-none flex-col",
      "has-[>[data-slot=chat-sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:overflow-clip",
    ],
    sidebarHeader: ["flex shrink-0 items-center gap-3"],
    sidebarHeaderMask: ["pointer-events-none absolute inset-x-0 top-0 -z-10 hidden"],
    sidebarHeaderMaskLayer: ["absolute inset-x-0 top-0"],
    sidebarHeaderTitle: ["truncate text-lg font-bold text-foreground-strong"],
    sidebarGroupLabel: [
      "px-2 pt-1 pb-2",
      "font-mono text-[10px] font-medium uppercase tracking-wider text-foreground-muted",
    ],
    sidebarBody: ["relative flex min-h-0 flex-1 overflow-hidden"],
    sidebarContent: ["relative flex min-h-0 min-w-0 flex-1"],
    sidebarViewport: ["h-full min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto"],
    sidebarContentInner: [
      "min-h-full min-w-0 w-full px-2 pt-3",
      "pb-[var(--chat-sidebar-content-bottom,0.75rem)]",
    ],
    sidebarScrollbar: [
      "z-30 flex w-3 justify-center py-1 opacity-0 transition-opacity duration-150",
      "pointer-events-none",
      "data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
    ],
    sidebarScrollbarThumb: ["w-1.5 rounded-full"],
    sidebarLiveActivity: ["pointer-events-none absolute inset-x-0 max-md:hidden"],
  },
  variants: {
    theme: {
      brutal: {
        sidebarRoot:
          "md:has-[>[data-slot=chat-sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:[--chat-sidebar-content-bottom:3.25rem]",
        sidebarHeader: [
          "h-[var(--shell-header-height,62px)] shrink-0 border-b-2 border-black bg-brutal-cream px-5",
          "max-md:bg-primary-400 max-md:px-4",
          "[@media(max-height:600px)]:h-12",
        ],
        sidebarBody: "bg-brutal-cream max-md:bg-white",
        sidebarLiveActivity: "bottom-0 z-40",
        sidebarScrollbarThumb: "bg-black/35 hover:bg-black/55",
      },
      elegant: {
        sidebarRoot: [
          "relative [--sidebar-inset-x:28px] md:[--sidebar-inset-x:26px]",
          "md:[--sidebar-inset-end:18px]",
          "md:has-[>[data-slot=chat-sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:[--chat-sidebar-content-bottom:4.25rem]",
        ],
        sidebarHeader: [
          "absolute inset-x-0 top-0 z-20 isolate",
          "h-[var(--shell-header-height,56px)] border-b-0 bg-transparent",
          "px-[var(--sidebar-inset-x,26px)] md:pr-[var(--sidebar-inset-end,var(--sidebar-inset-x,26px))]",
          "[&_[data-slot=notification-center-trigger]]:-mr-2",
        ],
        sidebarHeaderMask: ["block h-[calc(100%+0.75rem)]"],
        sidebarHeaderMaskLayer: ["h-full", ...headerMaskLayers],
        sidebarHeaderTitle: "font-heading text-[17px] font-medium text-foreground-muted",
        sidebarBody: "bg-layer-page",
        sidebarContentInner: [
          "px-[var(--sidebar-inset-x,26px)] md:pr-[var(--sidebar-inset-end,var(--sidebar-inset-x,26px))]",
          "pt-[var(--shell-header-height,56px)]",
        ],
        sidebarScrollbar: "justify-end",
        sidebarScrollbarThumb: "bg-foreground-muted/35 hover:bg-foreground-muted/55",
        sidebarLiveActivity: [
          "bottom-3 z-10",
          "pl-[26px] pr-4",
          ...liveActivityFadeOverlay,
          "[&>*]:relative [&>*]:z-10",
        ],
      },
    },
  },
});
