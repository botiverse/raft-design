import { tv } from "../../lib/tv";

export const card = tv({
  slots: {
    root: ["flex min-w-0 flex-col overflow-hidden", "text-foreground"],
    header: [
      "group/card-header grid min-w-0 auto-rows-min grid-cols-1 items-start gap-x-4 gap-y-1",
      "has-[>[data-slot=card-leading]]:grid-cols-[auto_minmax(0,1fr)]",
      "has-[>[data-slot=card-trailing]]:grid-cols-[minmax(0,1fr)_auto]",
      "has-[>[data-slot=card-leading]]:has-[>[data-slot=card-trailing]]:grid-cols-[auto_minmax(0,1fr)_auto]",
    ],
    title: [
      "col-start-1 row-start-1 min-w-0",
      "group-has-[>[data-slot=card-leading]]/card-header:col-start-2",
    ],
    leading: [
      "col-start-1 row-span-2 row-start-1",
      "flex shrink-0 items-center self-start",
      "[&>svg]:size-4 [&>svg]:shrink-0",
    ],
    description: [
      "col-start-1 row-start-2 min-w-0",
      "group-has-[>[data-slot=card-leading]]/card-header:col-start-2",
    ],
    trailing: [
      "col-start-2 row-start-1",
      "flex shrink-0 items-center self-center justify-self-end",
      "group-has-[>[data-slot=card-leading]]/card-header:col-start-3",
    ],
    content: ["min-w-0"],
    footer: ["flex min-w-0 flex-wrap items-center gap-2"],
  },
  variants: {
    theme: {
      brutal: {
        leading: ["min-h-5"],
        title: ["font-heading text-lg leading-5 font-bold"],
        description: ["font-sans text-sm leading-5 text-foreground-strong/60"],
        footer: [
          "flex-nowrap items-center",
          "font-sans text-xs leading-4 text-foreground-muted",
          "[&>svg]:size-3.5 [&>svg]:shrink-0",
          "[&>:not(svg)]:min-w-0",
        ],
      },
      elegant: {
        leading: ["min-h-[22px]"],
        title: ["font-sans text-base leading-[22px] font-medium"],
        description: [
          "font-sans text-xs leading-4 tracking-[0.01em] text-pretty",
          "text-foreground-muted",
        ],
        footer: [
          "flex-nowrap items-center",
          "font-sans text-xs leading-4 text-foreground-hint",
          "[&>svg]:size-3.5 [&>svg]:shrink-0",
          "[&>:not(svg)]:min-w-0",
        ],
      },
    },
    variant: {
      default: {},
      inset: {},
    },
  },
  defaultVariants: {
    variant: "default",
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "default",
      class: {
        root: ["border-2 border-line-strong bg-layer-panel", "shadow-raft-md"],
        header: "border-b-2 border-line-strong p-4",
        content: "p-4",
        footer: "border-t-2 border-line-strong bg-layer-inset px-4 py-3",
      },
    },
    {
      theme: "brutal",
      variant: "inset",
      class: {
        root: ["border-2 border-line-strong bg-layer-panel px-2", "shadow-raft-md"],
        header: "px-4 py-3",
        content: "-mx-2 border-y-2 border-line-strong bg-layer-panel px-6 py-4",
        footer: "px-4 py-3",
      },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel",
          "shadow-raft-xs dark:border-transparent",
        ],
        header: "p-5 has-[+[data-slot=card-content]]:pb-0",
        content: "p-5",
        footer: [
          "border-t border-line-hairline bg-layer-inset px-5 py-3.5",
          "dark:border-transparent dark:bg-transparent",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "inset",
      class: {
        root: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-card p-[2px]",
          "shadow-raft-xs dark:border-transparent",
        ],
        header: "px-5 py-3.5",
        content: [
          "overflow-clip rounded-[5.5px] border-[0.5px] border-line-hairline bg-layer-panel p-5",
          "dark:border-transparent dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.04),0_0_0_1px_oklch(0_0_0/0.35)]",
        ],
        footer: "px-5 py-3",
      },
    },
  ],
});
