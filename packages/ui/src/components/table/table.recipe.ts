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
      "[&>tr]:hover:bg-fill-row-hover",
    ],
    row: [
      "not-aria-selected:not-data-[selected=true]:data-popup-open:bg-fill-row-open",
      "not-aria-selected:not-data-[selected=true]:has-data-popup-open:bg-fill-row-open",
      "aria-selected:bg-info-soft aria-selected:hover:bg-info-soft",
      "data-[selected=true]:bg-info-soft data-[selected=true]:hover:bg-info-soft",
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
  },
});
