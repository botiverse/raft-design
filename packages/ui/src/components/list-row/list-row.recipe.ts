import { listCell, listCellFocus, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

// Raft Design System › ListRow: the one row of phone lists, settings, and the
// people and agents on a detail page. A list is content: no ink line, no
// shadow. The whole row is the target: hover lays the subtle tier and press
// the medium tier. Between two rows a hairline runs from where the text starts.
// A settings card keeps that look. A list of places or people on a phone
// opts in with `cell` (design/patterns/lists.md): the row is a list cell
// (lib/list-cell.ts), with no line, and every state is drawn on its inset
// shape; its list spaces the rows 2px apart and pads its ends by 8px.
const hairline = [
  "before:pointer-events-none before:absolute before:top-0 before:right-0 before:hidden",
  "before:left-(--list-row-rule-start) before:border-t before:border-line-hairline",
  "[[data-slot=list-row]+&]:before:block [li+li>&]:before:block",
];

export const listRow = tv({
  slots: {
    group: [
      "flex min-w-0 flex-col overflow-hidden",
      "rounded-container border border-line-hairline bg-layer-card text-foreground",
    ],
    // The row owns its three inks and the parts read them, so the tone and the
    // disabled state are decided once, on the row: a tone never applies to a
    // disabled row, which greys everything.
    root: [
      "group/list-row flex w-full min-w-0 items-center gap-3 py-3 text-left",
      "font-sans no-underline",
      "[--list-row-ink:var(--foreground)] [--list-row-ink-2:var(--foreground-muted)] [--list-row-ink-3:var(--foreground-hint)]",
      "[--list-row-status-space:0px]",
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
    // SaveStatus makes up this 2px to sit 4px under the description
    // (save-status.tsx): change both together. In a plain row the body hands
    // its reserved status line to the row's bottom padding (the negative
    // margin, read from the row), so the row's ends centre on the text alone.
    body: ["flex min-w-0 flex-1 flex-col gap-0.5", "-mb-(--list-row-status-space,0px)"],
    line: ["flex min-w-0 items-center gap-2"],
    title: [
      "min-w-0 flex-1 truncate",
      "text-body font-semibold",
      "group-data-[tone=unread]/list-row:font-bold",
    ],
    // Data about the row's subject, which the row exists to show (a
    // description someone wrote, a topic, a role, an app's byline): the title's
    // ink at 400 and a size down, so size and weight, not colour, set it
    // apart (design/foundations/typography.md#notes-on-deeper-surfaces).
    subtitle: ["min-w-0 flex-1 truncate", "text-footnote font-normal text-(--list-row-ink)"],
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
      // a preview, the time and a badge. The line starts at the text, 16 + 35 + 12.
      default: {
        root: "min-h-16 pointer-coarse:min-h-14 pointer-coarse:py-2 [--list-row-rule-start:63px]",
      },
      // A setting: a title (and its consequence), the current value and a
      // chevron, or a switch; 12px (`settings-row-inset`) above and below its
      // tallest part: 46 with one line and a switch with a mouse, 54 by touch. The line starts at the
      // row's edge. Its ends, the leading icon, avatar or tile and the
      // trailing switch, value or chevron, centre on the whole row, with or
      // without a description: a setting reads as one unit, and its controls
      // belong to the row, not to the title (Alignment: a control and its
      // label). When the body ends in a SaveStatus, they centre on the title
      // and description instead: the row moves the reserved line (4px and
      // one footnote line, save-status.tsx) out of the box its ends centre in
      // and into its bottom padding, so the empty line doesn't pull them
      // below the text, and the row keeps its height (Jasper/Kirby,
      // 2026-11-09, #proj-raft-ui:#220). The has variant styles the row itself
      // and the body reads the space it sets (Selector Cost in CLAUDE.md).
      plain: {
        root: [
          "py-(--settings-row-inset) pb-[calc(var(--settings-row-inset)+var(--list-row-status-space))]",
          "has-[>[data-slot=list-row-body]>[data-slot=save-status]]:[--list-row-status-space:calc(--spacing(1)+var(--text-footnote--line-height))]",
          "[--list-row-rule-start:16px]",
        ],
      },
      // A shortcut into another page (Search, Activity, Saved): a 20px icon and
      // a name, 48 tall. A group of them is a set of buttons, so no lines.
      entry: { root: "" },
    },
    interactive: {
      true: {},
      false: {},
    },
    // A row that belongs to the setting in the row above it (quiet hours'
    // times, a server's channel overrides under its level): no hairline
    // above it, since a hairline says "another setting", and in a settings
    // group no top padding, so the owning row's bottom inset is the only
    // space between them (cindyz, 2026-11-10, #proj-raft-ui:4ae1a74e).
    attached: {
      true: {},
      false: {},
    },
    cell: {
      false: {
        root: [
          "relative px-4",
          "transition-colors duration-100",
          "outline-none focus-visible:keyboard:inset-ring-2 focus-visible:keyboard:inset-ring-foreground",
          "data-selected:bg-info-soft",
        ],
      },
      true: {
        root: [listCell, listCellFocus, "data-selected:before:bg-fill-cell-selected"],
      },
    },
    wrap: {
      true: { description: "whitespace-normal text-pretty" },
      false: {},
    },
  },
  compoundVariants: [
    { cell: false, attached: false, variant: ["default", "plain"], class: { root: hairline } },
    { variant: "plain", attached: true, class: { root: "pt-0" } },
    {
      cell: false,
      interactive: true,
      class: {
        root: [
          "not-disabled:not-aria-disabled:not-data-selected:hover:overlay-subtle",
          "not-disabled:not-aria-disabled:not-data-selected:active:overlay-medium",
          "not-data-selected:data-popup-open:overlay-subtle",
        ],
      },
    },
    { cell: true, interactive: true, class: { root: listCellStates } },
  ],
  defaultVariants: {
    variant: "default",
    interactive: true,
    attached: false,
    cell: false,
    wrap: false,
  },
});
