import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["mt-1 w-full max-w-[480px]"],
    // Top-aligned: a title can wrap, and a folded card carries a description
    // line under it, so the icon, status and toggle line up with the title's
    // first line instead of floating between lines.
    header: ["flex items-start gap-2 leading-snug"],
    headerIcon: [
      "flex size-5 shrink-0 items-center justify-center",
      "[&>svg]:size-3 [&>svg]:shrink-0",
    ],
    headerTitle: ["min-w-0 flex-1"],
    // What happened (Done, Declined) or why you cannot act (View only), shown
    // under the title so it stays visible while the card is folded.
    headerDescription: ["block font-normal"],
    headerStatus: ["ml-auto shrink-0"],
    collapseTrigger: [
      "-mt-0.5 -mr-1 -mb-1 flex size-6 shrink-0 cursor-pointer items-center justify-center",
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
        headerDescription: "text-xs leading-4 text-black/65",
        collapseTrigger: "hover:bg-black/5",
      },
      elegant: {
        header: "py-2 text-[13px] font-[550]",
        headerIcon: "rounded-md bg-foreground/6 text-foreground-muted",
        headerDescription: "text-[13px] leading-5 text-foreground-muted",
        collapseTrigger: "rounded-md hover:bg-foreground/5",
      },
    },
  },
});
