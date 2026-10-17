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
    status: [],
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
      raft: {
        root: "group/action-card mt-2 max-w-[440px]",
        header: [
          "gap-2 px-3 pt-3 pb-2 group-data-closed/action-card:pb-3",
          "text-subhead font-bold text-foreground",
        ],
        headerIcon: [
          "size-[27px] rounded-sticker bg-fill-muted text-foreground-icon",
          "[&>svg]:size-3.5",
        ],
        headerTitle: "pt-[3.5px]",
        headerDescription: "mt-0.5 text-footnote font-normal text-foreground-muted",
        headerStatus: "mt-[5.5px] text-caption font-semibold text-foreground-muted",
        status: [
          "inline-flex h-auto items-center gap-1.5 rounded-none border-0 bg-transparent p-0 shadow-none",
          "text-caption font-semibold text-foreground-muted",
          "before:size-[9px] before:shrink-0 before:rounded-[2px] before:border-[1.5px] before:border-sticker-ink before:content-['']",
        ],
        collapseTrigger: [
          "my-0 -mr-1 size-[27px] rounded-control text-foreground-icon",
          "hover:bg-fill-pressed hover:text-foreground active:bg-fill-pressed",
          "focus-visible:outline-none focus-visible:shadow-raft-focus",
          "[&>svg]:size-4",
        ],
      },
    },
    tone: {
      neutral: {},
      primary: {},
      information: {},
      accent: {},
      success: {},
      warning: {},
      danger: {},
    },
  },
  compoundVariants: [
    { theme: "raft", tone: "neutral", class: { status: "before:bg-inactive" } },
    { theme: "raft", tone: "primary", class: { status: "before:bg-primary" } },
    { theme: "raft", tone: "information", class: { status: "before:bg-info" } },
    { theme: "raft", tone: "accent", class: { status: "before:bg-accent" } },
    { theme: "raft", tone: "success", class: { status: "before:bg-success" } },
    { theme: "raft", tone: "warning", class: { status: "before:bg-warning" } },
    { theme: "raft", tone: "danger", class: { status: "before:bg-danger" } },
  ],
});

export type MessageActionCardStatusTone =
  | "neutral"
  | "primary"
  | "information"
  | "accent"
  | "success"
  | "warning"
  | "danger";
