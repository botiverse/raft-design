---
title: Separator
summary: A 1px hairline between groups of content in one region, horizontal or vertical, with an optional word in the middle of a horizontal one.
status: stable
aliases: [Divider]
category: layout
related: [dropdown-menu, select, popover, panel, card]
---

# Separator

A separator is a 1px `line-hairline` between two groups of content in the same region: two groups of settings, or two controls in a row. A horizontal separator can carry a short word in its middle that names the group after it, such as Actions. Lines between regions are not separators; they belong to the regions ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).

```example
separator/compositions/horizontal
```

## When to use

| Situation                                                   | Use                                                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Two groups of content in one region                         | Separator                                                                                     |
| Two groups of controls in a row of fixed height             | Separator with `orientation="vertical"`                                                       |
| A named break before a group                                | Separator with a word: Actions                                                                |
| Sections of a menu, a select list or a popover              | The component's own separator: `DropdownMenuSeparator`, `SelectSeparator`, `PopoverSeparator` |
| Rows of a list                                              | The list's own dividers ([ListRow](../list-row/list-row.md))                                  |
| A header and its content, a rail and a sidebar, two columns | The `line-seam` the region draws ([Color](../../../../../design/foundations/color.md#lines))  |
| Sections of a large form                                    | [FormSection](../form-section/form-section.md), which draws its own hairline                  |

## Variants

| Variant                              | Use for                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `orientation="horizontal"` (default) | Stacked groups. It takes the full width                                                       |
| `orientation="vertical"`             | Groups side by side in a row. It takes the height of the row, so the row needs a fixed height |
| Horizontal, with children            | A word between two lines, in `text-footnote`, semibold, `foreground-hint`                     |

## Content

- Keep the word short, in sentence case: Actions.

## Accessibility

- Separator wraps the Base UI Separator, which gives it the `separator` role and its orientation.
- The two lines around a word are hidden from assistive technology; the word is read.

## Rules

- Use only `line-hairline` in a separator. Don't restyle it as a seam or a strong line: each line means something ([Color](../../../../../design/foundations/color.md#lines)).
- Never draw a separator next to a region's own edge. Two 1px lines side by side read as one 2px line ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).
