---
title: Table
summary: Rows and columns of data on native table elements, for the few places that need columns, such as usage, billing and permissions.
status: stable
aliases: [Data table]
layer: core
category: data-display
related: [description-list, list-row, code-block, scroll-area]
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
- `TableSortableHead` (`@botiverse/raft-ui/wip`): a `TableHead` that sorts the rows, in place of `TableHead` for a column that sorts ([Sorting](#sorting)). Its label is a `TableSortButton` filling the cell.
- `TableSortButton` (`@botiverse/raft-ui/wip`): the button of a heading that sorts, on its own, for a header row drawn without `Table`. It fills the heading cell around it and has no padding, no border and no type of its own: the cell sets the type, height and line, and you give the button the row's horizontal padding ([Sorting](#sorting)).
- `TableBody`, with a `TableRow` of `TableCell`s per row. Required.
- `TableScroll`: the area a table wider than its container scrolls sideways in, around the `Table` ([Wide tables](#wide-tables)). Optional.

The header type, the lines between rows and how numbers are set are in [Built from existing parts › Tables](../../../../../design/components/overview.md#tables). `Table` draws the header and the lines; the last row has none under it.

```example
table/compositions/basic
```

## States

| State                                                              | Look                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hover, press                                                       | The row lays `fill-subtle` over itself on hover, the subtle tier, and `fill-medium` on press; a selected row keeps `info-soft` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)) |
| Menu open (`data-popup-open` on `TableRow`, or on a button in it)  | `fill-subtle`, the same subtle tier as the hover, so the row the menu acts on stays marked; a selected row keeps `info-soft` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press))   |
| Selected (`aria-selected` or `data-selected="true"` on `TableRow`) | `info-soft`: a selected row is selected content                                                                                                                                                                 |

## Behavior

- Columns take the width of their content. When content would make them jump (a value that changes, rows that load in), add the `table-fixed` class to `Table` and set the widths with `TableColgroup` and `TableColumn`.
- Text in a cell wraps at any character, so an ID or a name without spaces breaks inside its column instead of pushing the table past its container.
- Cells align their content to the top, so a row with a 2-line description keeps its other values on the first line.

## Wide tables

A table that can be wider than its column scrolls sideways in an area of its own, `TableScroll`, and never widens the page: a page that scrolls sideways moves its header and navigation away with the table, and on a phone every vertical swipe then drifts sideways too.

```example
table/compositions/wide
```

- Wrap the `Table` in `TableScroll`. It is a horizontal [ScrollArea](../scroll-area/scroll-area.md) and takes ScrollArea's props but `orientation`, so the table scrolls under raft-ui's thin scrollbar, not the platform's, and never with `overflow-x-auto` on a wrapper of your own ([Native scrolling](../scroll-area/scroll-area.md#native-scrolling)). A plain `<table>` goes in it the same way.
- Give the `Table` the least width its columns can be read at, such as `min-w-280`. A column header never wraps and text in a cell wraps at any character, so without a least width the table first squeezes every column to its header's width, a long cell becoming a tall, narrow strip of broken words, and scrolls only once the headers themselves don't fit. With a least width, the table fills a container wider than that and scrolls in a narrower one, with its columns still readable. Columns of a fixed width (`table-fixed` with `TableColgroup`) need the same least width.
- `TableScroll` has no frame and no size of its own: it is as wide as its container, and `className` goes to it. Where its container is a flex row or a grid, give it the width there, such as `w-full`.
- A header row that sticks to the top of the page (`sticky top-0`) no longer does inside `TableScroll`: the area is now its scrolling container. A first column that sticks to the side still does.
- It scrolls sideways only. A vertical wheel or swipe over the table scrolls the page as it does anywhere else, and at either end of the table a sideways scroll stops there and is not passed on to the page behind.
- The whole table scrolls, its header row with its columns and its caption with them. `Table` has no column that stays in place.
- The scrollbar is drawn, and the area is a tab stop, only while the table is wider than the area ([Accessibility](#accessibility)).

## Sorting

A column whose order someone would want to change, such as usage, a date or a name, sorts the rows when its heading is clicked. The rule is the same for any row of column headings, including a list that draws its own header row instead of using `Table`, and on the web and in the app.

`TableSortableHead` draws such a heading. Which column the rows are sorted by, and in which direction, stays in your state: pass the column's `sort` (`"ascending"`, `"descending"`, or nothing when the rows aren't sorted by it), and set it from `onSortChange`.

```example
table/compositions/sortable
```

- Make the heading's label a button that fills the heading cell, so a click anywhere on the heading sorts. Put `aria-sort` on the heading cell, not on the button: `ascending` or `descending` on the column the rows are sorted by, nothing on the others. Screen readers then read the direction with the column's name, so the label stays the column's name: "Memory", not "Sort by memory". A header row drawn without `Table` gives each heading cell `role="columnheader"`, inside a `role="row"` in a `role="table"` or `role="grid"`: screen readers read `aria-sort` on nothing else.
- At rest a heading that sorts looks like any other, in `foreground-hint`. Under the pointer it turns `foreground`, with no fill, so the header row still reads as a row of labels.
- The column the rows are sorted by has its heading in `foreground` and a 12px `arrow-down` (descending: the values get smaller down the column) or `arrow-up` (ascending) 4px from its label. No other heading shows an arrow, not even under the pointer, so the one arrow on screen always says what the order is. Every heading that sorts keeps the arrow's room, empty when it isn't sorted: a column sizes to its widest content, its heading included, so without it the columns move sideways each time the sort moves to another one.
- The arrow goes after the label, except in a right-aligned column, such as numbers, where it goes before it: the label stays over its numbers' right edge.
- Clicking the sorted column reverses it. Clicking another column sorts by that column in its first direction: largest or newest first for numbers and dates, A to Z for text. There are two directions and no third click back to unsorted: a click that removes the arrow looks like a click that did nothing.
- One column sorts at a time. Rows with the same value keep their order from before, and rows with no value (`—`, such as an offline computer's usage) go last in both directions: a missing value is not the smallest one.
- When the rows start in an order no column gives, such as the order they were added, no heading shows an arrow until one is clicked. If that order is worth going back to, make it a column, such as Added, rather than a third click. Remember the chosen sort for that list on that device, so coming back to the page doesn't reset it.
- On a touch screen the heading's button has a 44px-high hit area, as every control does ([Accessibility](../../../../../design/foundations/accessibility.md#hit-targets)). It grows upward only, so it never takes a tap from the first row: above a header row lower than 44px it reaches into what sits over the row, by 44px minus the row's height (16px over a 28px row). Leave that space free of controls, or give the controls there a stacking context of their own (`relative z-10`), so they keep their taps.

`TableSortableHead` sets `aria-sort` from `sort`, colors the label, draws the arrow and gives the touch hit area. A click calls `onSortChange` with the next direction: the reverse of `sort`, or `firstSort` on a column the rows aren't sorted by. `firstSort` is `"ascending"` unless set; pass `"descending"` for numbers and dates. Pass `align="right"` in a right-aligned column, as on its cells, so the arrow goes before the label. Native props, `className` and `ref` go to the heading cell, not to the button. Sorting the rows themselves, with the missing values last, and remembering the sort are yours: the part never sees the rows.

A header row drawn without `Table`, such as a list's grid of `div`s, has the type of the list it heads, such as `text-mono-meta` for list metadata ([Typography](../../../../../design/foundations/typography.md#sizes-by-use)), and its own height and line. Put a `TableSortButton` in each heading cell that sorts. It is the same button, with the same label color, arrow, arrow room, touch hit area and `sort`, `firstSort`, `onSortChange` and `align`, but with no padding and no border, and it inherits the cell's font. It fills the cell, so the whole cell is the target and the focus ring goes around it: give the cell no padding and let it stretch to the row's height (don't set `items-center` on the row; the button centers its label), and give the button the row's horizontal padding with `className`, such as `px-2`, so its label starts and ends where the values do. Don't wrap the button in another element or give the cell a height of its own that the button doesn't fill: the target would shrink back to the label. Set `aria-sort={sort}` on the cell yourself, and give the cell `role="columnheader"` inside a `role="row"` in a `role="table"` or `role="grid"`. In development the button warns when it has no such cell around it or the cell's `aria-sort` isn't its `sort`. Native props, `className` and `ref` go to the button.

```example
table/compositions/drawn-header
```

`TableSortableHead` also takes `render`, such as `render={<div role="columnheader" />}`, for a cell that should look like a `TableHead`: the header type, the line under it and the cell's padding.

## Content

- Write column headings in sentence case: Resource, Access, Last run ([Writing](../../../../../design/content/writing.md#casing)).
- `TableCell` doesn't set numbers in Space Mono or align them. Set Space Mono on the cell (`font-mono`), and pass `align="right"` to the cell and to its column's heading, `TableHead` or `TableSortableHead`, so the heading sits over its numbers. The heading keeps the header type, not Space Mono. Don't align with a class: on a `TableSortableHead`, or on the cell around a `TableSortButton`, it does nothing, because the label is a button filling the cell; pass `align="right"` to the button too.
- Write a caption in sentence case that names what the rows are: Recent builds.

## Accessibility

- The parts render native `table`, `caption`, `thead`, `tbody`, `tr`, `th` and `td` elements, so screen readers can move by row and column.
- `TableHead` sets `scope="col"`. Row headings (`scope="row"`) work but have no style of their own.
- `TableSortableHead` sets `scope="col"` too, but none with `render`, since only a `th` takes `scope`. It sets `aria-sort` on the heading cell only while the rows are sorted by its column. Its label is a native `button` named by the column's name alone; the arrow is `aria-hidden`, so the direction is read from `aria-sort`. With `render`, the element it renders keeps `aria-sort`, so give it `role="columnheader"` ([Sorting](#sorting)).
- `TableSortButton` sets no `aria-sort`: a button can't carry it. Set it on the heading cell around the button, a `role="columnheader"` in a `role="row"` in a `role="table"` or `role="grid"`, from the same `sort`. In development it warns in the console when there is no such cell or the two differ.
- `TableScroll` is a tab stop while the table is wider than it, so someone using the keyboard can focus it and scroll with the arrow keys; a table that fits adds no stop. Leave that on: a table's cells often take no focus, and then nothing else can scroll it. Pass `tabIndex={-1}` only when every row holds a control that takes focus and scrolls into view. The area is a `<div>` with no role, so give it `role="region"` and an `aria-label` naming the table, so focusing it says what it is ([ScrollArea](../scroll-area/scroll-area.md#accessibility)).
- Name every table with a `TableCaption`, visible or `sr-only`. Use `aria-label` on `Table` only when there can be no caption.
- Give a control in a cell a name that includes its row: "Access for Messages".

## Rules

- Keep the header row even when the design shows none: hide it with `sr-only`. Without it, the columns lose their names.
- Wrap a table that can be wider than its container in `TableScroll`, with a least width on the `Table` ([Wide tables](#wide-tables)). Never let it widen the page.
- Don't add vertical lines, an outer border or a header fill. A composite adds no new lines or colors ([Built from existing parts](../../../../../design/components/overview.md#built-from-existing-parts)).
