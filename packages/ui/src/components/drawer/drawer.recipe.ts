import { tv } from "../../lib/tv";

const drawerMotion = tv({
  slots: {
    overlay: [
      "opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))]",
      "transition-opacity duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
      "data-starting-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-150",
      "motion-reduce:transition-none",
    ],
    popup: [
      "[--drawer-blur:2px] [--drawer-ease:cubic-bezier(0.32,0.72,0,1)]",
      "[--closed-transform:translate3d(var(--drawer-exit-x,0px),var(--drawer-exit-y,0px),0)]",
      "[--drawer-stack-peek:1rem] [--drawer-stack-step:0.05]",
      "[--drawer-stack-progress:clamp(0,var(--drawer-swipe-progress),1)]",
      "[--drawer-stack-offset:max(0px,calc((var(--nested-drawers)-var(--drawer-stack-progress))*var(--drawer-stack-peek)))]",
      "[--drawer-stack-scale-base:calc(max(0,1-(var(--nested-drawers)*var(--drawer-stack-step))))]",
      "[--drawer-stack-scale:clamp(0,calc(var(--drawer-stack-scale-base)+(var(--drawer-stack-step)*var(--drawer-stack-progress))),1)]",
      "[--drawer-stack-shrink:calc(1-var(--drawer-stack-scale))]",
      "[--drawer-stack-shrink-offset:calc(var(--drawer-stack-shrink)*var(--drawer-stack-size))]",
      "[transform-origin:var(--drawer-transform-origin)]",
      "transform-[translate3d(calc(var(--drawer-swipe-x,0px)+var(--drawer-stack-x,0px)),calc(var(--drawer-swipe-y,0px)+var(--drawer-stack-y,0px)),0)_scale(var(--drawer-stack-scale))]",
      "opacity-100 blur-0",
      "transition-[transform,height,opacity,filter] duration-240 ease-(--drawer-ease) will-change-transform",
      "data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*180ms)]",
      "data-starting-style:transform-(--closed-transform) data-starting-style:opacity-0 data-starting-style:blur-(--drawer-blur)",
      "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-0 data-ending-style:blur-(--drawer-blur)",
      "data-swiping:duration-0 data-nested-drawer-swiping:duration-0 motion-reduce:transition-none",
    ],
    content: [
      "transition-opacity duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
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
      "text-foreground",
      "[--drawer-inset:0.75rem] [--drawer-content-height:var(--drawer-height,auto)]",
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
    actions: ["flex w-full flex-col items-stretch gap-2.5", "[&_[data-slot=button]]:w-full"],
    title: ["max-w-sm text-pretty text-center text-2xl leading-8 text-foreground-strong"],
    description: ["max-w-sm text-pretty text-center text-sm leading-5 text-foreground/60"],
  },
  variants: {
    theme: {
      brutal: {
        title: ["font-bold"],
        swipeHandle: ["before:rounded-none before:bg-ink-40"],
        popup: ["border-2 border-line-strong bg-layer-panel shadow-brutal-lg"],
        close: ["bg-layer-panel"],
        closeIcon: ["size-5"],
      },
      elegant: {
        overlay: ["backdrop-blur-[2px]"],
        popup: ["overflow-clip rounded-lg bg-layer-popover shadow-xl md:rounded-xl"],
        close: ["p-0 text-foreground-placeholder hover:bg-transparent hover:text-foreground"],
        closeIcon: ["size-4"],
        header: ["bg-layer-panel px-8 pt-9 pb-2"],
        body: ["bg-layer-panel px-8 pt-4 pb-7"],
        footer: ["mt-0 px-8 py-5"],
        title: ["font-sans text-2xl leading-8 font-semibold"],
        description: ["font-sans text-sm leading-5 text-foreground-muted"],
      },
    },
    side: {
      down: {
        popup: [
          "[--drawer-inset:max(0.75rem,env(safe-area-inset-bottom,0px))]",
          "bottom-(--drawer-inset) min-h-64 max-h-[82vh]",
        ],
        swipeHandle: ["before:top-3"],
      },
      up: {
        popup: [
          "[--drawer-inset:max(0.75rem,env(safe-area-inset-top,0px))]",
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
        popup: ["[--drawer-inset:1.25rem]"],
      },
    },
    {
      theme: "brutal",
      side: "down",
      class: {
        popup: ["[--drawer-inset:max(1.25rem,env(safe-area-inset-bottom,0px))]"],
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
