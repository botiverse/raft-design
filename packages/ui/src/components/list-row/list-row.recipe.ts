import { tv } from "../../lib/tv";

// Raft Design System › ListRow: the one row of phone lists, settings, and the
// people and agents on a detail page. A list is content: no ink line, no
// shadow. The whole row is the target, and hover and press lay the pressed
// overlay. Between two rows a hairline runs from where the text starts.
const hairline = [
  "before:pointer-events-none before:absolute before:top-0 before:right-0 before:hidden",
  "before:left-(--list-row-rule-start) before:border-t before:border-line-muted",
  "[[data-slot=list-row]+&]:before:block [li+li>&]:before:block",
];

export const listRow = tv({
  slots: {
    group: [
      "flex min-w-0 flex-col overflow-hidden",
      "rounded-container border border-line-muted bg-layer-card text-foreground",
    ],
    root: [
      "group/list-row relative flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left",
      "font-sans text-foreground no-underline",
      "transition-colors duration-100",
      "outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-foreground",
      "data-selected:bg-info-soft",
      "disabled:cursor-not-allowed disabled:text-foreground-disabled",
      "aria-disabled:cursor-not-allowed aria-disabled:text-foreground-disabled",
    ],
    icon: [
      "flex shrink-0 items-center justify-center",
      "text-foreground-hint [&>svg]:size-5 [&>svg]:shrink-0",
      "group-disabled/list-row:text-foreground-disabled group-aria-disabled/list-row:text-foreground-disabled",
    ],
    body: ["flex min-w-0 flex-1 flex-col gap-0.5"],
    line: ["flex min-w-0 items-center gap-2"],
    title: [
      "min-w-0 flex-1 truncate",
      "text-body font-semibold",
      "group-data-[tone=unread]/list-row:font-bold",
      "group-data-[tone=muted]/list-row:text-foreground-muted",
      "group-data-[tone=away]/list-row:text-foreground-hint",
    ],
    description: [
      "min-w-0 flex-1 truncate",
      "text-callout text-foreground-muted",
      "group-data-[tone=unread]/list-row:text-foreground",
      "group-data-[tone=away]/list-row:text-foreground-hint",
      "group-disabled/list-row:text-foreground-disabled group-aria-disabled/list-row:text-foreground-disabled",
    ],
    meta: ["shrink-0", "font-mono text-mono-meta font-normal tabular-nums text-foreground-hint"],
    value: ["max-w-[45%] shrink-0 truncate", "text-subhead text-foreground-hint"],
    chevron: [
      "flex shrink-0 items-center justify-center",
      "text-foreground-hint [&>svg]:size-5 [&>svg]:shrink-0",
    ],
  },
  variants: {
    variant: {
      // A conversation, a person, an agent: a 35px leading block, a title and
      // a preview, the time and a badge. The line starts at the text, 16 + 35 + 12.
      default: { root: ["min-h-16 [--list-row-rule-start:63px]", hairline] },
      // A setting: a title (and its consequence), the current value and a
      // chevron, or a switch. The line starts at the row's edge.
      plain: { root: ["min-h-11 [--list-row-rule-start:16px]", hairline] },
      // A shortcut into another page (Search, Activity, Saved): a 20px icon and
      // a name. A group of them is a set of buttons, so no lines between.
      entry: { root: "min-h-11" },
    },
    interactive: {
      true: {
        root: [
          "not-disabled:not-aria-disabled:not-data-selected:hover:press-overlay",
          "not-disabled:not-aria-disabled:not-data-selected:active:press-overlay",
          "not-data-selected:data-popup-open:press-overlay",
        ],
      },
      false: {},
    },
    wrap: {
      true: { description: "whitespace-normal text-pretty" },
      false: {},
    },
  },
  defaultVariants: {
    variant: "default",
    interactive: true,
    wrap: false,
  },
});
