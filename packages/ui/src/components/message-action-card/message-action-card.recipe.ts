import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["w-full", "group/action-card mt-2 max-w-[440px]"],
    // Top-aligned: a title can wrap, and a folded card carries a description
    // line under it, so the icon, status and toggle line up with the title's
    // first line instead of floating between lines.
    header: [
      "flex items-start",
      "gap-2 px-3 pt-3 pb-2 group-data-closed/action-card:pb-3",
      "text-subhead font-bold text-foreground",
    ],
    headerIcon: [
      "flex shrink-0 items-center justify-center",
      "[&>svg]:shrink-0",
      "size-[27px] rounded-sticker bg-fill-muted text-foreground-muted",
      "[&>svg]:size-3.5",
    ],
    headerTitle: ["min-w-0 flex-1", "pt-[calc((27px-1lh)/2)]"],
    // What happened (Done, Declined) or why you cannot act (View only), shown
    // under the title so it stays visible while the card is folded.
    headerDescription: ["block", "mt-0.5 text-footnote font-normal text-foreground-muted"],
    headerStatus: [
      "ml-auto shrink-0",
      "mt-[calc((27px-1lh)/2)] text-caption font-semibold text-foreground-muted",
    ],
    status: [
      "inline-flex h-auto items-center gap-1.5 rounded-none border-0 bg-transparent p-0 shadow-none",
      "text-caption font-semibold text-foreground-muted",
      "before:size-2.5 before:shrink-0 before:rounded-[2px] before:border-[1.5px] before:border-sticker-ink before:content-['']",
    ],
    collapseTrigger: [
      "flex shrink-0 cursor-pointer items-center justify-center",
      "[&>svg]:transition-transform [&>svg]:duration-200 motion-reduce:[&>svg]:transition-none",
      "data-panel-open:[&>svg]:rotate-180",
      "focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-offset-1",
      "my-0 -mr-1 size-[27px] rounded-chip text-foreground-muted",
      "hover:bg-fill-medium hover:text-foreground active:bg-fill-medium",
      "focus-visible:outline-none focus-visible:shadow-focus",
      "[&>svg]:size-4",
    ],
  },
  variants: {
    tone: {
      neutral: { status: ["before:bg-inactive"] },
      primary: { status: ["before:bg-presence-busy"] },
      information: { status: ["before:bg-info"] },
      accent: { status: ["before:bg-attention"] },
      success: { status: ["before:bg-success"] },
      warning: { status: ["before:bg-warning"] },
      danger: { status: ["before:bg-danger"] },
    },
  },
});

export type MessageActionCardStatusTone =
  | "neutral"
  | "primary"
  | "information"
  | "accent"
  | "success"
  | "warning"
  | "danger";
