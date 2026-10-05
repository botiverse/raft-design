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
    // live on the cells, and the last row drops its cell borders here.
    row: ["last:[&>td]:border-b-0"],
    head: ["text-left whitespace-nowrap"],
    cell: ["align-top wrap-break-word"],
    colgroup: [],
    column: [],
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
