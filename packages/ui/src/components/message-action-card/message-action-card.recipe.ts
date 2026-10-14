import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["mt-1 w-full max-w-[480px]"],
    header: ["flex items-center gap-2 leading-snug"],
    headerIcon: [
      "flex size-5 shrink-0 items-center justify-center",
      "[&>svg]:size-3 [&>svg]:shrink-0",
    ],
    headerTitle: ["min-w-0 flex-1"],
    headerStatus: ["ml-auto shrink-0"],
    collapseTrigger: [
      "-my-1 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center",
      "text-foreground-muted hover:text-foreground-strong",
      "[&>svg]:size-3.5 [&>svg]:transition-transform [&>svg]:duration-200 motion-reduce:[&>svg]:transition-none",
      "data-panel-open:[&>svg]:rotate-180",
      "focus-visible:outline-2 focus-visible:outline-offset-1",
    ],
  },
  variants: {
    theme: {
      brutal: {
        // A suggested action reads as a card in the message stream: the
        // control-plane border and 2px hard shadow (a 4px panel shadow stacks
        // heavily when one message carries several cards), and a tinted title
        // band ruled off at 2px like every other Brutal divider.
        root: "group/action-card border-2 border-line-strong bg-layer-panel shadow-raft-sm",
        // Folded, the band is the whole card: drop its rule so the card's own
        // bottom border is the only one.
        header: [
          "border-b-2 border-line-strong bg-layer-inset px-3 py-2 text-sm font-bold text-foreground-strong",
          "group-data-closed/action-card:border-b-0",
        ],
        headerIcon: "border border-line-strong bg-layer-panel text-foreground-strong",
        collapseTrigger: "hover:bg-black/5",
      },
      elegant: {
        header: "py-2 text-[13px] font-[550]",
        headerIcon: "rounded-md bg-foreground/6 text-foreground-muted",
        collapseTrigger: "rounded-md hover:bg-foreground/5",
      },
    },
  },
});
