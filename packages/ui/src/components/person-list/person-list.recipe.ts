import { listCell, listCellFocus, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

// Raft Design System › PersonList: the people in a popover (who is viewing,
// who has read it), each row a list cell (design/patterns/lists.md) at a
// popup row's height. The list is the cells' column: 2px between rows, 8px at
// its ends. A row is one line: the face, the name, then its status words. It
// is as tall as a menu item (option-height: 34px with a mouse, 36px on a
// touch screen), a row of a popup list (spacing.md#hit-targets), not ListRow's
// 64px. Its state shape is the list cell's, inset 8px with radius-control, and
// the content sits 8px inside it at every input, so it starts 16px from the
// popover's edge, on the line of the popover's title and text (PopoverBody).
// A row that says more than a status (Working now: what each agent is doing)
// takes two lines: a content column with the name in bold and a description
// under it, clamped to 2 lines. Its height follows the content at the same
// inset, and the face, an sm one with its light there, centers on the row.
// The last status ends the row; one before it stays beside the name. A name
// or status with a status after it ends with a comma only a screen reader
// hears ("Martin, viewing"): an inline ::after at 0px, so it takes no room.
// Each part is a flex item, so the browser puts the space after the comma; in
// a two-line row the name's comma comes before the description.
export const personList = tv({
  slots: {
    list: ["m-0 flex list-none flex-col gap-0.5 p-0 py-2"],
    item: ["flex min-w-0"],
    row: [
      ...listCell,
      "[--cell-pad-x:8px]",
      "[--person-list-comma:',']",
      "flex w-full min-w-0 items-center gap-2 text-left",
      "min-h-option py-option-inset",
      "font-sans text-callout text-foreground no-underline",
      "*:data-[slot=avatar]:shrink-0",
    ],
    name: [
      "min-w-0 truncate",
      "not-last:after:text-[0px] not-last:after:leading-0 not-last:after:content-(--person-list-comma)",
    ],
    content: ["flex min-w-0 flex-1 flex-col", "*:data-[slot=person-list-item-name]:font-bold"],
    description: ["line-clamp-2 text-footnote text-foreground-muted"],
    status: [
      "shrink-0 whitespace-nowrap",
      "text-footnote text-foreground-muted tabular-nums",
      "last:ms-auto last:ps-2",
      "not-last:after:text-[0px] not-last:after:leading-0 not-last:after:content-(--person-list-comma)",
    ],
  },
  variants: {
    interactive: {
      true: {
        row: [...listCellStates, ...listCellFocus, "cursor-pointer"],
      },
      false: {},
    },
  },
  defaultVariants: { interactive: true },
});
