---
title: Table
summary: Rows and columns of data on native table elements, for the few places that need columns, such as usage, billing and permissions.
status: stable
aliases: [Data table]
layer: core
category: data-display
related: [description-list, list-row, code-block]
---

# Table

A table lays out data in rows and columns, with a header row and a hairline between rows. Use it only when the data has to be compared down columns, such as usage, billing or the permissions of an app. Everything else reads better as a [DescriptionList](../description-list/description-list.md) or as [ListRow](../list-row/list-row.md) rows ([Built from existing parts](../../../../../design/components/overview.md#tables)).

## When to use

| Situation                                                                    | Use                                                                                                                                                               |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Values compared down columns: usage per month, invoices, access per resource | Table                                                                                                                                                             |
| The properties of one item: Status, Assignee, Created by                     | [DescriptionList](../description-list/description-list.md)                                                                                                        |
| A list of people, agents, channels or settings                               | [ListRow](../list-row/list-row.md)                                                                                                                                |
| A table in Markdown that someone wrote in a message                          | The `MarkdownTable` parts, in the code block's container ([Built from existing parts](../../../../../design/components/overview.md#diagrams-and-markdown-tables)) |

## Anatomy

- `Table`: the `table` element. It fills its container's width and has no outer border. Required.
- `TableCaption`: the table's name, shown under the table in `text-caption` and `foreground-hint`, or hidden with `sr-only`. Required unless the table has an `aria-label`.
- `TableColgroup` and `TableColumn`: optional column widths.
- `TableHeader`, with one `TableRow` of `TableHead` cells: the column headings. Required.
- `TableBody`, with a `TableRow` of `TableCell`s per row. Required.

The header type, the lines between rows and how numbers are set are in [Built from existing parts › Tables](../../../../../design/components/overview.md#tables). `Table` draws the header and the lines; the last row has none under it.

## States

| State                                                              | Look                                                                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Hover                                                              | The row lays the pressed overlay over itself ([States](../../../../../design/foundations/states.md#usage)) |
| Selected (`aria-selected` or `data-selected="true"` on `TableRow`) | `info-soft`: a selected row is selected content                                                            |

## Behavior

- Columns take the width of their content. When content would make them jump (a value that changes, rows that load in), add the `table-fixed` class to `Table` and set the widths with `TableColgroup` and `TableColumn`.
- Text in a cell wraps at any character, so an ID or a name without spaces breaks inside its column instead of pushing the table past its container.
- Cells align their content to the top, so a row with a 2-line description keeps its other values on the first line.

## Content

- Write column headings in sentence case: Resource, Access, Last run ([Writing](../../../../../design/content/writing.md#casing)).
- `TableCell` doesn't set numbers in Space Mono or align them: set both on the cell and on its `TableHead`, so the heading sits over its numbers.
- Write a caption in sentence case that names what the rows are: Recent builds.

## Accessibility

- The parts render native `table`, `caption`, `thead`, `tbody`, `tr`, `th` and `td` elements, so screen readers can move by row and column.
- `TableHead` sets `scope="col"`. Row headings (`scope="row"`) work but have no style of their own.
- Name every table with a `TableCaption`, visible or `sr-only`. Use `aria-label` on `Table` only when there can be no caption.
- Give a control in a cell a name that includes its row: "Access for Messages".

## Rules

- Keep the header row even when the design shows none: hide it with `sr-only`. Without it, the columns lose their names.
- Don't add vertical lines, an outer border or a header fill. A composite adds no new lines or colors ([Built from existing parts](../../../../../design/components/overview.md#built-from-existing-parts)).
