---
title: FitToolbar
summary: A toolbar whose items give way in named steps (label to icon, into More, a group to one button, a group to the next line, the primary action to +) as the region it sits in narrows, measured rather than guessed.
status: experimental
aliases: [Give way, Toolbar fit, Responsive toolbar, Overflow toolbar]
layer: core
category: actions
related: [selection-toolbar, segmented-control, dropdown-menu]
---

# FitToolbar

`FitToolbar` is a toolbar that keeps one row as its region narrows by letting its items give way, one step at a time, in an order they declare. It is the shared engine of [When a row runs out of room](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room): [SelectionToolbar](../selection-toolbar/selection-toolbar.md) is built on it, and the list toolbars of Tasks, Computers, Members and search will use it (#proj-raft-ui:#225). It measures its content in the width of its own region, never the window's: a task list can be 320px or 512px wide on the same screen. So its parent must have a definite width (a column, a panel, a block that fills its row), not one sized by the toolbar: a parent that shrinks to fit the toolbar always has room for it.

```example
fit-toolbar/fit-toolbar
```

## When to use

| Situation                                                          | Use                                                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| A toolbar whose labels, groups or actions may not fit its region   | FitToolbar                                                                                   |
| A row of segments that turn into icons when their labels don't fit | [SegmentedControl](../segmented-control/segmented-control.md) with `iconsOnlyBelow="auto"`   |
| The toolbar for selected items                                     | [SelectionToolbar](../selection-toolbar/selection-toolbar.md), a FitToolbar that never wraps |

## Anatomy

- `FitToolbar`: the toolbar, a Base UI Toolbar: one Tab stop, the arrow keys inside, skipping what is hidden. `wrap` lets its groups move to lines of their own.
- `FitToolbarGroup`: a group of items in one row, a fixed gap apart. `firstLine` keeps it on the first line; `wrapOrder` says when it wraps; `wrapLine` names the line it wraps onto; `collapsed` is the group as one button (a Filter button for its filters), shown from `collapseOrder` on. `overflow="scroll"` makes it scroll sideways instead (see Behavior).
- `useFitItem(steps)`: makes an element an item; spread its `props` on it. `steps` gives each step the item can take its order: `{ label: 30, more: 40 }`. `moreItem` is what the item is in More's menu. `taken(step)` says which steps it has taken, for what it renders (a tooltip once its label is gone).
- `FitToolbarButton`: a toolbar button that can give way: an `md` Button with an icon and a label, an icon square with its label as a tooltip from `labelOrder` on, a + square with its label as a tooltip from `plusOrder` on, in More from `moreOrder` on. `collapsedIcon` is an icon shown only once the label has given way, in place of `icon`: a button that reads as text while it has room (Clear filters) and as an icon (×) once it hasn't. A button with neither an icon nor a `collapsedIcon` refuses its `label` step, since nothing would be left to show.
- `FitToolbarPicker`: a picker's trigger as one toolbar item (a filter: Assignee, Status): a [PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md) with an icon, a label, what is chosen (`value`) and a chevron. Pass the popup's trigger as `trigger` (`<DropdownMenuTrigger />`, `<PopoverTrigger />`); the picker renders it as the toolbar button. With a value it fills `info-soft` by itself, as an applied filter does ([Select › Filters](../select/select.md#filters)), so the page styles nothing. A count (a number, or a string of digits) is set in Space Mono; any other value (In progress, Kirby) keeps the label's font, since Space Mono is for what machines write ([Typography](../../../../../design/foundations/typography.md)). From `labelOrder` on its label gives way and the icon, what is chosen and the chevron stay (# ⌄, 👤 1 ⌄): the chevron says it opens a list, as on every PickerTriggerButton. Its accessible name is the label, then what is chosen ("Assignee 1"), and the label shows as its tooltip.
- `useFitMore()`: makes an element the toolbar's More; spread its `props` on it. Hide it until it carries `data-fit-shown`.
- `FitToolbarMoreItems`: the items in More, in their order: put it in More's menu.
- `useInFitToolbar()`: true inside a FitToolbar, for a control that would otherwise measure its own fit.

## Behavior

- The steps, each written on the item as `data-fit-<step>` for its styles:
  - `label`: its label hides and its icon stays, the label kept as its accessible name and its tooltip.
  - `more`: it moves into More (`data-fit-more`; hide it).
  - `collapse`: a group shows its one button instead of its items.
  - `wrap`: a group moves to a line of its own, only with `wrap`.
  - `plus`: a primary action shows as + alone (`FitToolbarButton`'s `plusOrder`), its icon and label gone, the label kept as its accessible name and its tooltip.
- The steps of every item go into one order for the whole toolbar: by the number each item gives them, the lower first; at the same number the last item first, and one item's steps in the order above (`label`, `more`, `collapse`, `wrap`, `plus`). A step's name says nothing about when it comes: the numbers do. A list toolbar gives its numbers in this order: the filters' labels, then the groups' `wrap`, then the primary's `plus` (say 10, 20, 30). After each step the toolbar measures again, and stops at the first that fits. It starts from nothing taken on every measure, so the outcome depends on the width alone and doesn't flicker. It measures after every render, whenever its region changes size, whenever its content changes on its own (a label that becomes "Copied", a count, an item inside a child that rendered alone) and when a font arrives.
- Items of the same kind in one group change form at the same time: the same `label` (or `plus`) step at the same number, in one `FitToolbarGroup`, is one step for all of its items, taken and given back together. A group already says its items are one kind, and a row of filters half icons and half labels reads as broken: at 780px Tasks showed three filters as icons beside Assignee with its label (sindresorhus; Jasper's call, 2026-11-10). Give an item another number to let it go on its own.
- It wraps only between groups, from the end. Groups with the same `wrapLine` wrap onto the same line, in their order, the toolbar's gap apart; a group without one takes a line of its own. Each line starts at the toolbar's start, the toolbar's gap below the one before, and its groups are never spread across it: a gap that grows with the width would be one more distance to read. The page decides which groups stay on the first line (`firstLine`), because it knows which controls people reach for first.
- Once a group has wrapped, what its items gave before it wrapped is given back, the last first, wherever the toolbar still fits without it: filters that wrapped to the second line get their labels back, and so does a New task button there. The toolbar measures from nothing taken every time, so the result depends on the width alone: the same width gives the same toolbar whether it is narrowing or widening, and it never flickers between two.
- A group with `overflow="scroll"` takes the rest of its line and scrolls sideways instead of giving way, its items whole, in a horizontal [ScrollArea](../scroll-area/scroll-area.md) (a small scrollbar only while it scrolls, no tab stop of its own), the side that hides more fading (`mask-fade-x`, [Edges fade](../../../../../design/foundations/spacing.md#edges-fade)). A vertical wheel scrolls it, and an item that takes focus, by Tab or the arrow keys, comes into view clear of the fade. It gives way itself only when it can't show one whole item. stdrc chose it for a phone's filters (2026-11-10): a row of filters that wraps pushes the list down, while one that scrolls keeps every filter one swipe away. It works as slock web's FilterStrip does, so the web can move to it. Whether narrow lists on a desktop scroll too is still open, so it is a group's choice, with no width built in.
- An item the person applied or chose in a scrolling group (an active filter) is always in view: mark it `data-active`, and the group scrolls it into view when it mounts and whenever it becomes active, with no animation. A filter that narrows the list must never sit hidden off the edge. Put applied filters first as well, so they are in view before any scrolling.
- A [SegmentedControl](../segmented-control/segmented-control.md) in the toolbar follows it: give it a `label` step (spread `useFitItem({ label })`'s props on it) and it shows only its icons while that step is taken. Its own `iconsOnlyBelow` is off there (`useInFitToolbar`), because two measures of the same room would disagree: the toolbar knows what else gives way first. A control of text alone (Mine and All with their counts) refuses the step and keeps its labels: with no icons there would be nothing left to show.
- A scrolling group scrolls only as its last state. While it can still wrap and hasn't, it counts as not fitting whenever its items overflow it, so the steps before its `wrap` (the filters' labels) come first, then the wrap, and only a group on a line of its own scrolls. Before, at 780px the filters scrolled on the first line with their labels kept, the last ones hidden past the fade, where giving the labels fit them all (sindresorhus, 2026-11-10). A group that can't wrap (`firstLine`, or a toolbar without `wrap`) scrolls as before.
- A scrolling group stays where the person scrolled it. Each measure starts from nothing taken, which can shrink its content for a moment (labels given before the wrap) and pull its scroll back; the toolbar keeps the scroll position across the measure. The active item is scrolled into view only when it newly becomes active (`data-active` added, or an item added that carries it), and the group's first layouts keep it in view only until the person scrolls: a count changing, a measure or a resize after that leaves the group where they put it. Before, a count that changed on its own scrolled the filters back to the active one under the person's finger (risk 3 of sindresorhus' review, with Jasper, 2026-11-10).
- A toolbar that floats over content leaves `wrap` off, because a second line would cover what it floats over: its last step is into More ([SelectionToolbar](../selection-toolbar/selection-toolbar.md#behavior)).
- The primary action becomes + only after the groups have wrapped: give its `plus` a higher number than any `wrap`. It is the last step, because a + is the least clear form of the action people came for, and wrapping costs only a line. Tasks at 375px and 420px needs it (sindresorhus, #proj-raft-ui:#225): once the filters have wrapped to their own scrolling line, the first line (Mine and All with their counts, sort, list or board, Create task) fits only with Create task as +. A `plus` taken before a wrap would not be given back after it, since it is on the first line.
- Fits means nothing pokes out of the toolbar or out of any of its groups, and no line has broken by itself. Its items don't shrink (`shrink-0` groups): a control is never squeezed below its own content.
- It measures only what is laid out in the row: it looks through `display: contents` and leaves out what is hidden, out of flow (`position: absolute` or `fixed`) or of no size. A popover, menu or tooltip opened from a toolbar item puts focus guards beside its trigger, fixed at the window's corner, and they are not part of the row: counted, opening a popup made the toolbar give way. Items on one line may differ in height (a primary Button beside 32px filters); a line has broken only where an item sits wholly below or above the first on it.

## Composition

The Tasks toolbar: Mine and All (text alone, so they keep their labels), list or board and Create task stay on the first line; the filters (pickers with what is chosen, and Clear filters as × once it gives way) scroll, give their labels, then wrap to a line of their own (20) before Create task becomes + (30). Narrow the box to watch the steps.

```example
fit-toolbar/compositions/tasks
```

## Accessibility

- Give `FitToolbar` an `aria-label`. The arrow keys skip what has moved into More, and More's menu holds it.
- Focus follows the reading order, not the DOM's (WCAG 2.4.3, Focus Order): a wrapped group moves with CSS `order`, so it can sit later on screen than where it is in the DOM, and neither the browser's Tab order nor Base UI's toolbar follows `order`. The arrow keys go through the controls line by line as they show, in the DOM's order on each line, and Tab first enters the toolbar at the first control on screen, then wherever the person last was. A text field keeps the arrow keys while its caret can still move.
- The toolbar is one Tab stop, a SegmentedControl in it too: the control registers as one toolbar item, its segments reachable by Tab only while it holds the toolbar's stop, and the toolbar's arrow keys move through its segments without choosing one (Space chooses; Base UI's radio ignores Enter on purpose).
- One Tab stop for the whole toolbar holds only while every control in it is a Base UI Toolbar part (`Toolbar.Button`, `Toolbar.Link`, `Toolbar.Input`, or a trigger rendered through one, as `FitToolbarButton` and `FitToolbarPicker` are) or registers as one item the way SegmentedControl does. A plain `<button>` dropped in stays a Tab stop of its own, and the arrow keys still reach it in reading order.
- Up and Down choose nothing in a horizontal toolbar, on a segment too: a SegmentedControl's radio group would choose the next segment, while Left and Right only move between the toolbar's items.
- When the focused item moves into More (the region narrowed under it), focus goes to More, where the item now is, rather than falling to the page. Focus the person moved out of the toolbar stays where they put it.
- An item showing its icon alone keeps its label as its accessible name; show the label as a tooltip too.

## Open

- It stays in wip until sindresorhus confirms the step names and the API for the list toolbars of #225.
- Where the right-hand group (list or board, Create task) sits once the filters wrap, at the end of the first line or after the filters, waits on stdrc's choice between A, B and C (#proj-raft-ui:#225). Today it stays at the first line's end.
- Moving an item out of the toolbar, to a page's menu or another region, is not a give-way step: where an item lives is the page's layout decision, so the page renders it there itself. FitToolbar has no step for it.
