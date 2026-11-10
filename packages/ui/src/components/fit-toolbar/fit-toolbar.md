---
title: FitToolbar
summary: A toolbar whose items give way in named steps (label to icon, into More, a group to one button, primary to +, a group to the next line) as the region it sits in narrows, measured rather than guessed.
status: experimental
aliases: [Give way, Toolbar fit, Responsive toolbar, Overflow toolbar]
layer: core
category: actions
related: [selection-toolbar, segmented-control, dropdown-menu]
---

# FitToolbar

`FitToolbar` is a toolbar that keeps one row as its region narrows by letting its items give way, one step at a time, in an order they declare. It is the shared engine of [When a row runs out of room](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room): [SelectionToolbar](../selection-toolbar/selection-toolbar.md) is built on it, and so are the list toolbars of Tasks, Computers, Members and search (#proj-raft-ui:#225). It measures its content in the width of its own region, never the window's: a task list can be 320px or 512px wide on the same screen.

## When to use

| Situation                                                          | Use                                                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| A toolbar whose labels, groups or actions may not fit its region   | FitToolbar                                                                                   |
| A row of segments that turn into icons when their labels don't fit | [SegmentedControl](../segmented-control/segmented-control.md) with `iconsOnlyBelow="auto"`   |
| The toolbar for selected items                                     | [SelectionToolbar](../selection-toolbar/selection-toolbar.md), a FitToolbar that never wraps |

## Anatomy

- `FitToolbar`: the toolbar, a Base UI Toolbar: one Tab stop, the arrow keys inside, skipping what is hidden. `wrap` lets its groups move to lines of their own.
- `FitToolbarGroup`: a group of items in one row, a fixed gap apart. `firstLine` keeps it on the first line; `wrapOrder` says when it wraps; `collapsed` is the group as one button (a Filter button for its filters), shown from `collapseOrder` on.
- `useFitItem(steps)`: makes an element an item; spread its `props` on it. `steps` gives each step the item can take its order: `{ label: 30, more: 40 }`. `moreItem` is what the item is in More's menu. `taken(step)` says which steps it has taken, for what it renders (a tooltip once its label is gone).
- `useFitMore()`: makes an element the toolbar's More; spread its `props` on it. Hide it until it carries `data-fit-shown`.
- `FitToolbarMoreItems`: the items in More, in their order: put it in More's menu.

## Behavior

- The steps, each written on the item as `data-fit-<step>` for its styles:
  - `label`: its label hides and its icon stays, the label kept as its accessible name and its tooltip.
  - `more`: it moves into More (`data-fit-more`; hide it).
  - `group`: a group shows its one button instead of its items.
  - `plus`: a primary action shows as + alone.
  - `wrap`: a group moves to a line of its own, only with `wrap`.
- Steps are taken in their order, the lower first; at the same order the last item first. After each step the toolbar measures again, and stops at the first that fits. It starts from nothing taken on every measure, so the outcome depends on the width alone and doesn't flicker. It measures after every render, whenever its region changes size and when a font arrives.
- It wraps only between groups. Each group that wraps takes a line of its own, at the line's start, the toolbar's gap below the line before: its groups are never spread across a line. The page decides which groups stay on the first line (`firstLine`); the others wrap from the end.
- A toolbar that floats over content leaves `wrap` off, because a second line would cover what it floats over: its last step is into More ([SelectionToolbar](../selection-toolbar/selection-toolbar.md#behavior)).
- Fits means nothing pokes out of the toolbar or out of any of its groups. Its items don't shrink (`shrink-0` groups): a control is never squeezed below its own content.

## Accessibility

- Give `FitToolbar` an `aria-label`. The arrow keys skip what has moved into More, and More's menu holds it.
- An item showing its icon alone keeps its label as its accessible name; show the label as a tooltip too.
