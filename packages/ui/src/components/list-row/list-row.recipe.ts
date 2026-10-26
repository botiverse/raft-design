import { listCell, listCellFocus, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

// Raft Design System › ListRow: the one row of phone lists, settings, and the
// people and agents on a detail page. A list is content: no ink line, no
// shadow, and no divider between two rows. The row is a list cell
// (lib/list-cell.ts): the whole row is the target, and hover, press,
// selection and focus are drawn on its inset shape.

export const listRow = tv({
  slots: {
    group: [
      "flex min-w-0 flex-col gap-0.5 overflow-hidden py-0.5",
      "rounded-container border border-line-hairline bg-layer-card text-foreground",
    ],
    // The row owns its three inks and the parts read them, so the tone and the
    // disabled state are decided once, on the row: a tone never applies to a
    // disabled row, which greys everything.
    root: [
      "group/list-row flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left",
      "font-sans no-underline",
      listCell,
      listCellFocus,
      "data-selected:before:bg-fill-cell-selected",
      "[--list-row-ink:var(--foreground)] [--list-row-ink-2:var(--foreground-muted)] [--list-row-ink-3:var(--foreground-hint)]",
      "text-(--list-row-ink)",
      "not-disabled:not-aria-disabled:data-[tone=unread]:[--list-row-ink-2:var(--foreground)]",
      "not-disabled:not-aria-disabled:data-[tone=muted]:[--list-row-ink:var(--foreground-muted)]",
      "not-disabled:not-aria-disabled:data-[tone=away]:[--list-row-ink:var(--foreground-hint)]",
      "not-disabled:not-aria-disabled:data-[tone=away]:[--list-row-ink-2:var(--foreground-hint)]",
      "disabled:cursor-not-allowed disabled:[--list-row-ink:var(--foreground-disabled)]",
      "disabled:[--list-row-ink-2:var(--foreground-disabled)] disabled:[--list-row-ink-3:var(--foreground-disabled)]",
      "aria-disabled:cursor-not-allowed aria-disabled:[--list-row-ink:var(--foreground-disabled)]",
      "aria-disabled:[--list-row-ink-2:var(--foreground-disabled)] aria-disabled:[--list-row-ink-3:var(--foreground-disabled)]",
    ],
    icon: [
      "flex shrink-0 items-center justify-center",
      "text-(--list-row-ink-3) [&>svg]:size-5 [&>svg]:shrink-0",
    ],
    body: ["flex min-w-0 flex-1 flex-col gap-0.5"],
    line: ["flex min-w-0 items-center gap-2"],
    title: [
      "min-w-0 flex-1 truncate",
      "text-body font-semibold",
      "group-data-[tone=unread]/list-row:font-bold",
    ],
    description: ["min-w-0 flex-1 truncate", "text-callout text-(--list-row-ink-2)"],
    // The time or a count, kept whole beside the title, which gives way
    // first; a value with no room left (an email in a 320px row beside a
    // button) truncates rather than overflowing the row
    // (design/patterns/responsive.md#when-a-row-runs-out-of-room).
    meta: [
      "min-w-0 truncate",
      "font-mono text-mono-meta font-normal tabular-nums text-(--list-row-ink-3)",
    ],
    value: ["max-w-[45%] shrink-0 truncate", "text-subhead text-(--list-row-ink-3)"],
    chevron: [
      "flex shrink-0 items-center justify-center",
      "text-(--list-row-ink-3) [&>svg]:size-5 [&>svg]:shrink-0",
    ],
  },
  variants: {
    variant: {
      // A conversation, a person, an agent: a 35px leading block, a title and
      // a preview, the time and a badge.
      default: { root: "min-h-16" },
      // A setting: a title (and its consequence), the current value and a
      // chevron, or a switch; 48 tall with one line. Its ends, the leading
      // icon, avatar or tile and the trailing switch, value or chevron, centre
      // on the whole row, with or without a description: a setting reads as
      // one unit, and its controls belong to the row, not to the title
      // (Alignment: a control and its label).
      plain: { root: "" },
      // A shortcut into another page (Search, Activity, Saved): a 20px icon and
      // a name, 48 tall.
      entry: { root: "" },
    },
    interactive: {
      true: {
        root: listCellStates,
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
