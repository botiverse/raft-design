import { tv } from "../../lib/tv";

const drawerMotion = tv({
  slots: {
    overlay: [
      "opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))]",
      "transition-opacity duration-200 ease-slide",
      "data-starting-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-150",
      "motion-reduce:transition-none",
    ],
    popup: [
      "[--drawer-blur:2px] [--drawer-ease:var(--ease-slide)]",
      "[--closed-transform:translate3d(var(--drawer-exit-x,0px),var(--drawer-exit-y,0px),0)]",
      "[--drawer-stack-peek:16px] [--drawer-stack-step:0.05]",
      "[--drawer-stack-progress:clamp(0,var(--drawer-swipe-progress),1)]",
      "[--drawer-stack-offset:max(0px,calc((var(--nested-drawers)-var(--drawer-stack-progress))*var(--drawer-stack-peek)))]",
      "[--drawer-stack-scale-base:calc(max(0,1-(var(--nested-drawers)*var(--drawer-stack-step))))]",
      "[--drawer-stack-scale:clamp(0,calc(var(--drawer-stack-scale-base)+(var(--drawer-stack-step)*var(--drawer-stack-progress))),1)]",
      "[--drawer-stack-shrink:calc(1-var(--drawer-stack-scale))]",
      "[--drawer-stack-shrink-offset:calc(var(--drawer-stack-shrink)*var(--drawer-stack-size))]",
      "origin-(--drawer-transform-origin)",
      "transform-[translate3d(calc(var(--drawer-swipe-x,0px)+var(--drawer-stack-x,0px)),calc(var(--drawer-swipe-y,0px)+var(--drawer-stack-y,0px)),0)_scale(var(--drawer-stack-scale))]",
      "opacity-100 blur-0",
      "transition-[transform,height,opacity,filter] duration-240 ease-(--drawer-ease) will-change-transform",
      "data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*180ms)]",
      "data-starting-style:transform-(--closed-transform) data-starting-style:opacity-0 data-starting-style:blur-(--drawer-blur)",
      "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-0 data-ending-style:blur-(--drawer-blur)",
      "data-swiping:duration-0 data-nested-drawer-swiping:duration-0 motion-reduce:transition-none",
    ],
    content: [
      "transition-opacity duration-150 ease-slide motion-reduce:transition-none",
      "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100",
    ],
    swipeHandle: [
      "transition-opacity duration-150 motion-reduce:transition-none",
      "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100",
    ],
  },
  variants: {
    side: {
      down: {
        popup: [
          "[--drawer-exit-y:calc(100%+var(--drawer-inset)+2px)]",
          "[--drawer-stack-y:calc(0px-var(--drawer-stack-offset)-var(--drawer-stack-shrink-offset))]",
          "[--drawer-transform-origin:50%_100%]",
        ],
      },
      up: {
        popup: [
          "[--drawer-exit-y:calc(-100%-var(--drawer-inset)-2px)]",
          "[--drawer-stack-y:calc(var(--drawer-stack-offset)+var(--drawer-stack-shrink-offset))]",
          "[--drawer-transform-origin:50%_0%]",
        ],
      },
      left: {
        popup: [
          "[--drawer-exit-x:calc(-100%-var(--drawer-inset)-2px)]",
          "[--drawer-stack-x:calc(var(--drawer-stack-offset)+var(--drawer-stack-shrink-offset))]",
          "[--drawer-transform-origin:0%_50%]",
        ],
      },
      right: {
        popup: [
          "[--drawer-exit-x:calc(100%+var(--drawer-inset)+2px)]",
          "[--drawer-stack-x:calc(0px-var(--drawer-stack-offset)-var(--drawer-stack-shrink-offset))]",
          "[--drawer-transform-origin:100%_50%]",
        ],
      },
    },
    axis: {
      x: {
        popup: ["[--drawer-stack-size:100%]", "[--drawer-swipe-x:var(--drawer-swipe-movement-x)]"],
      },
      y: {
        popup: [
          "[--drawer-stack-size:max(0px,var(--drawer-frontmost-height,var(--drawer-height)))]",
          "[--drawer-swipe-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y))]",
        ],
      },
    },
    snapPoints: {
      true: {
        overlay: ["[--drawer-overlay-min-opacity:0.5]"],
      },
    },
  },
});

export const drawer = tv({
  extend: drawerMotion,
  slots: {
    overlay: [
      "fixed inset-0 z-50 min-h-dvh select-none",
      "bg-layer-backdrop",
      "supports-[-webkit-touch-callout:none]:absolute",
    ],
    viewport: ["pointer-events-none fixed inset-0 z-50 select-none"],
    popup: [
      "group/drawer-popup pointer-events-auto fixed z-50 flex h-(--drawer-content-height) flex-col outline-none",
      "text-foreground-strong",
      "[--drawer-inset:12px] [--drawer-content-height:var(--drawer-height,auto)]",
      "data-nested-drawer-open:overflow-hidden",
    ],
    content: [
      "flex min-h-0 flex-1 flex-col rounded-[inherit] select-text",
      "group-data-swiping/drawer-popup:select-none",
    ],
    swipeHandle: [
      "relative z-10 shrink-0 cursor-grab select-none active:cursor-grabbing",
      "before:absolute before:rounded-full before:bg-ink-20 before:content-['']",
    ],
    close: ["shrink-0"],
    closeIcon: [],
    header: ["flex flex-col items-center px-6 pt-8 pb-2 text-center"],
    body: ["flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center"],
    footer: ["mt-auto px-6 py-5"],
    actions: ["flex w-full flex-col items-stretch gap-2.5", "**:data-[slot=button]:w-full"],
    title: ["max-w-sm text-pretty text-center text-2xl leading-8 text-foreground"],
    description: ["max-w-sm text-pretty text-center text-sm leading-5 text-foreground-strong/60"],
  },
  variants: {
    theme: {
      brutal: {
        title: ["font-bold"],
        swipeHandle: ["before:rounded-none before:bg-ink-40"],
        popup: ["border-2 border-line-strong bg-layer-panel shadow-raft-xl"],
        close: ["bg-layer-panel"],
        closeIcon: ["size-5"],
      },
      elegant: {
        overlay: ["backdrop-blur-[2px]"],
        popup: ["overflow-clip rounded-lg bg-layer-popover shadow-raft-xl md:rounded-xl"],
        close: [
          "p-0 text-foreground-placeholder hover:bg-transparent hover:text-foreground-strong",
        ],
        closeIcon: ["size-4"],
        header: ["bg-layer-panel px-8 pt-9 pb-2", "dark:bg-transparent"],
        body: ["bg-layer-panel px-8 pt-4 pb-7", "dark:bg-transparent"],
        footer: ["mt-0 px-8 py-5"],
        title: ["font-sans text-2xl leading-8 font-semibold"],
        description: ["font-sans text-sm leading-5 text-foreground-muted"],
      },
      raft: {
        // A modal sheet dims the page behind it like a dialog does, so it is
        // clear the rest of the window is out of reach until it closes.
        overlay: ["bg-layer-backdrop"],
        popup: ["bg-layer-popover text-foreground", "shadow-raft-float ring-1 ring-line-seam"],
        swipeHandle: ["before:rounded-[1px] before:bg-line-seam"],
        closeIcon: ["size-5.5"],
        header: ["items-stretch gap-1 px-4 pt-4 pb-2 text-left"],
        body: ["items-stretch px-4 pt-2 pb-4 text-left"],
        footer: ["px-4 pt-3 pb-4"],
        actions: ["gap-2"],
        title: ["max-w-none text-left font-sans text-headline font-bold"],
        description: ["max-w-none text-left font-sans text-callout text-foreground-muted"],
      },
    },
    // Raft DS › Sheet: the 420 drawer for details and settings, and the wide
    // 640 drawer for bigger settings you only touch for a moment (an agent's
    // setup, an app's registration).
    width: {
      default: {},
      wide: {},
    },
    side: {
      down: {
        popup: [
          "[--drawer-inset:max(12px,env(safe-area-inset-bottom,0px))]",
          "bottom-(--drawer-inset) min-h-64 max-h-[82vh]",
        ],
        swipeHandle: ["before:top-3"],
      },
      up: {
        popup: [
          "[--drawer-inset:max(12px,env(safe-area-inset-top,0px))]",
          "top-(--drawer-inset) max-h-[80vh]",
        ],
        swipeHandle: ["order-last", "before:bottom-3"],
      },
      left: {
        popup: ["left-(--drawer-inset)"],
        swipeHandle: ["order-last", "before:right-3"],
      },
      right: {
        popup: ["right-(--drawer-inset)"],
        swipeHandle: ["before:left-3"],
      },
    },
    axis: {
      x: {
        popup: ["inset-y-3", "flex-row w-3/4 max-w-sm"],
        swipeHandle: [
          "my-auto h-16 w-11",
          "before:top-1/2 before:h-12 before:w-1.5 before:-translate-y-1/2",
        ],
        header: ["flex-row justify-between gap-3 pt-6 text-left"],
        body: ["items-stretch text-left"],
        footer: ["py-4"],
        title: ["min-w-0 max-w-none flex-1 text-left"],
        description: ["max-w-none text-left"],
      },
      y: {
        popup: [
          "data-nested-drawer-open:h-(--drawer-frontmost-height)",
          "inset-x-3 mx-auto md:max-w-md",
        ],
        swipeHandle: [
          "mx-auto h-11 w-16",
          "before:left-1/2 before:h-1.5 before:w-12 before:-translate-x-1/2",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      side: "right",
      class: {
        popup: ["[--drawer-inset:20px]"],
      },
    },
    {
      theme: "brutal",
      side: "down",
      class: {
        popup: ["[--drawer-inset:max(20px,env(safe-area-inset-bottom,0px))]"],
      },
    },
    {
      theme: "elegant",
      axis: "x",
      class: {
        popup: ["md:max-w-md"],
      },
    },
    {
      theme: "raft",
      axis: "x",
      class: {
        popup: ["inset-y-0 w-full max-w-[420px] [--drawer-inset:0px]"],
        // A side sheet's head is a panel head: on a phone (where the sheet
        // is the whole screen) it takes the panel head's edges, a leading
        // ghost Back 3px from the edge, mirroring the last action.
        header: [
          "min-h-14 shrink-0 items-center gap-2 border-b border-line-seam py-0 pr-3 pl-5",
          "max-md:pr-1.5 max-md:pl-4 max-md:[&>[data-slot=panel-action]:first-child]:-ml-[13px]",
        ],
        body: ["min-h-0 overflow-y-auto px-5 py-4"],
        footer: ["border-t border-line-seam px-5 py-3"],
        actions: ["flex-row flex-wrap justify-end", "**:data-[slot=button]:w-auto"],
        swipeHandle: ["before:w-1 before:h-9"],
      },
    },
    {
      theme: "raft",
      axis: "x",
      width: "wide",
      class: { popup: ["max-w-[640px]"] },
    },
    {
      theme: "raft",
      axis: "y",
      class: {
        popup: ["inset-x-0"],
        swipeHandle: ["h-4", "before:top-1.5 before:h-1 before:w-9"],
      },
    },
    {
      theme: "raft",
      side: "down",
      class: {
        popup: ["rounded-t-dialog [--drawer-inset:0px]", "pb-[env(safe-area-inset-bottom,0px)]"],
      },
    },
    {
      theme: "raft",
      side: "up",
      class: {
        popup: ["rounded-b-dialog [--drawer-inset:0px]", "pt-[env(safe-area-inset-top,0px)]"],
      },
    },
    {
      side: "down",
      snapPoints: true,
      class: {
        header: ["pt-2"],
      },
    },
    {
      axis: "y",
      snapPoints: true,
      class: {
        popup: ["[--drawer-content-height:100dvh]"],
      },
    },
  ],
});
