import { tv } from "../../lib/tv";

/**
 * The settings-grade table: unified header, row separators and cell padding in
 * the shared theme language (matching the markdown table's chrome tokens).
 * Column widths are the caller's business — pair `<TableColgroup>` with the
 * `table-fixed` class when stable widths matter; the base writes no
 * `table-layout` so that override is always available.
 */
export const table = tv({
  slots: {
    root: ["w-full border-collapse caption-bottom", "font-sans text-callout text-foreground"],
    header: [],
    // In the collapsed border model `tr` borders are not painted: separators
    // live on the cells, and the LAST BODY row drops its cell borders here.
    // Scoped to `tbody` on purpose — the header row is also the last row of
    // its `thead`, so a row-level `last:` rule would erase the header
    // separator too (review catch). Both `td` and `th` are cleared so a
    // row-header misuse does not leave a half line; row headers themselves
    // are not styled in v1 (`TableHead` is the column header).
    body: [
      "[&>tr:last-child>td]:border-b-0 [&>tr:last-child>th]:border-b-0",
      "[&>tr]:hover:bg-fill-subtle [&>tr]:active:bg-fill-medium",
    ],
    row: [
      "not-aria-selected:not-data-[selected=true]:data-popup-open:bg-fill-subtle",
      "not-aria-selected:not-data-[selected=true]:has-data-popup-open:bg-fill-subtle",
      "aria-selected:bg-info-soft aria-selected:hover:bg-info-soft aria-selected:active:bg-info-soft",
      "data-[selected=true]:bg-info-soft data-[selected=true]:hover:bg-info-soft data-[selected=true]:active:bg-info-soft",
    ],
    head: [
      "text-left whitespace-nowrap",
      "border-b border-line-hairline px-3 py-2",
      "text-footnote font-bold normal-case tracking-normal text-foreground-hint",
    ],
    // `wrap-anywhere` (not `wrap-break-word`): break-word does not reduce the
    // min-content width of an auto-layout column, so token-like names with no
    // spaces would push the table past its container (verified at 390px).
    cell: ["align-top wrap-anywhere", "border-b border-line-hairline px-3 py-2"],
    colgroup: [],
    column: [],
    caption: ["pt-2 text-caption text-foreground-hint"],
    // A heading that sorts (table.md, "Sorting") is a `head` whose padding
    // moves onto its button, so the button fills the cell and the row keeps
    // TableHead's height.
    sortableHead: ["p-0"],
    sortButton: [
      "relative flex w-full items-center gap-1",
      "border-0 bg-transparent px-3 py-2 [font:inherit]",
      "cursor-pointer rounded-sticker",
      "text-foreground-hint hover:text-foreground",
      "outline-none focus-visible:shadow-focus",
      // On a touch screen a transparent ::after takes the 34px heading to a
      // 44px-high hit area, centred on it (accessibility.md, Hit targets).
      "not-pointer-fine:after:absolute not-pointer-fine:after:inset-x-0 not-pointer-fine:after:content-['']",
      "not-pointer-fine:after:top-1/2 not-pointer-fine:after:h-11 not-pointer-fine:after:-translate-y-1/2",
    ],
    sortArrow: ["size-3 shrink-0"],
  },
  variants: {
    align: {
      left: {},
      right: { sortButton: "justify-end" },
    },
    sorted: {
      true: { sortButton: "text-foreground" },
      false: {},
    },
  },
});
