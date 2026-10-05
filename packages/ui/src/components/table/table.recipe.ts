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
    root: ["w-full border-collapse caption-bottom text-sm"],
    header: [],
    body: [],
    // In the collapsed border model `tr` borders are not painted: separators
    // live on the cells, and the last row drops its cell borders here (both
    // `td` and `th` — a `th` in the last body row must not keep a half line).
    // Row headers are not styled in v1: `TableHead` is the column header and
    // belongs in `TableHeader`; a `TableHead scope="row"` in the body would
    // inherit the header chrome, which v1 does not support.
    row: ["last:[&>td]:border-b-0 last:[&>th]:border-b-0"],
    head: ["text-left whitespace-nowrap"],
    // `wrap-anywhere` (not `wrap-break-word`): break-word does not reduce the
    // min-content width of an auto-layout column, so token-like names with no
    // spaces would push the table past its container (verified at 390px).
    cell: ["align-top wrap-anywhere"],
    colgroup: [],
    column: [],
    caption: ["text-foreground-muted"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-black"],
        head: ["border-b-2 border-black bg-brutal-cyan px-3 py-2 font-bold text-black"],
        cell: ["border-b-2 border-black px-3 py-2"],
      },
      elegant: {
        head: ["border-b border-line-muted bg-fill-muted/40 px-3 py-2 font-medium text-foreground"],
        cell: ["border-b border-line-hairline px-3 py-2"],
      },
    },
  },
});
