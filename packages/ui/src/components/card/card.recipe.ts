import { tv } from "../../lib/tv";

export const card = tv({
  slots: {
    root: ["flex min-w-0 flex-col overflow-hidden", "text-foreground"],
    header: [
      "grid min-w-0 auto-rows-min grid-cols-1 items-start gap-x-4 gap-y-1",
      "has-[>[data-slot=card-action]]:grid-cols-[minmax(0,1fr)_auto]",
    ],
    title: ["min-w-0"],
    description: ["min-w-0"],
    action: ["col-start-2 row-span-2 row-start-1 self-start justify-self-end"],
    content: ["min-w-0"],
    footer: ["flex min-w-0 items-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-line-strong bg-layer-panel", "shadow-raft-md"],
        header: ["p-4"],
        title: ["font-heading text-lg leading-5 font-bold"],
        description: ["font-sans text-sm leading-5 text-foreground-strong/60"],
        content: ["p-4"],
        footer: ["border-t-2 border-line-strong bg-layer-inset px-4 py-3"],
      },
      elegant: {
        root: [
          "rounded-lg border border-line-muted bg-layer-panel",
          "shadow-raft-xs dark:border-transparent",
        ],
        header: ["p-5"],
        title: ["font-sans text-sm leading-5 font-medium tracking-[-0.005em]"],
        description: ["font-sans text-sm leading-5 text-foreground-muted"],
        content: ["p-5"],
        footer: [
          "border-t border-line-muted bg-layer-inset px-5 py-3.5",
          "dark:border-transparent dark:bg-transparent",
        ],
      },
    },
  },
});
