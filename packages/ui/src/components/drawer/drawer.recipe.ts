import { tv } from "../../lib/tv";
import { panelHeadEdges } from "../panel/panel-header.recipe";

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
      "supports-[-webkit-touch-callout:none]:absolute", // A modal sheet dims the page behind it like a dialog does, so it is
      // clear the rest of the window is out of reach until it closes.
      "bg-layer-backdrop",
    ],
    viewport: ["pointer-events-none fixed inset-0 z-50 select-none"],
    popup: [
      "group/drawer-popup pointer-events-auto fixed z-50 flex h-(--drawer-content-height) flex-col outline-none",
      "[--drawer-inset:12px] [--drawer-content-height:var(--drawer-height,auto)]",
      "data-nested-drawer-open:overflow-hidden",
      "bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    content: [
      "flex min-h-0 flex-1 flex-col rounded-[inherit] select-text",
      "group-data-swiping/drawer-popup:select-none",
    ],
    swipeHandle: [
      "relative z-10 shrink-0 cursor-grab select-none active:cursor-grabbing",
      "before:absolute before:content-['']",
      "before:rounded-[1px] before:bg-line-seam",
    ],
    close: ["shrink-0"],
    closeIcon: ["size-5.5"],
    header: ["flex flex-col", "items-stretch gap-1 px-4 pt-4 pb-2 text-left"],
    body: ["flex flex-1 flex-col", "items-stretch px-4 pt-2 pb-4 text-left"],
    footer: ["mt-auto py-5", "px-4 pt-3 pb-4"],
    actions: ["flex w-full flex-col items-stretch", "**:data-[slot=button]:w-full", "gap-2"],
    title: [
      "text-pretty text-foreground",
      "max-w-none text-left font-sans text-headline font-bold",
    ],
    description: [
      "text-pretty",
      "max-w-none text-left font-sans text-callout text-foreground-muted",
    ],
  },
  variants: {
    side: {
      down: {
        popup: [
          "bottom-(--drawer-inset) min-h-64 max-h-[82vh]",
          "rounded-t-dialog [--drawer-inset:0px]",
          "pb-[env(safe-area-inset-bottom,0px)]",
        ],
        swipeHandle: ["before:top-3"],
      },
      up: {
        popup: [
          "top-(--drawer-inset) max-h-[80vh]",
          "rounded-b-dialog [--drawer-inset:0px]",
          "pt-[env(safe-area-inset-top,0px)]",
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
        popup: ["flex-row", "inset-y-0 w-full max-w-[420px] [--drawer-inset:0px]"],
        swipeHandle: [
          "my-auto h-16 w-11",
          "before:top-1/2 before:-translate-y-1/2",
          "before:w-1 before:h-9",
        ],
        header: [
          "min-h-14 shrink-0 flex-row items-center justify-between gap-2 py-0 text-left",
          "border-b border-line-seam",
          panelHeadEdges,
        ],
        body: ["items-stretch text-left", "min-h-0 overflow-y-auto px-5 py-4"],
        footer: ["border-t border-line-seam px-5 py-3"],
        title: ["min-w-0 max-w-none flex-1 text-left"],
        description: ["max-w-none text-left"],
        actions: ["flex-row flex-wrap justify-end", "**:data-[slot=button]:w-auto"],
      },
      y: {
        popup: [
          "data-nested-drawer-open:h-(--drawer-frontmost-height)",
          "mx-auto md:max-w-md",
          "inset-x-0",
        ],
        swipeHandle: [
          "mx-auto w-16",
          "before:left-1/2 before:-translate-x-1/2",
          "h-4",
          "before:top-1.5 before:h-1 before:w-9",
        ],
      },
    },
  },
  compoundVariants: [
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
