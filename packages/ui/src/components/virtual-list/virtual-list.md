---
title: VirtualList
summary: A scroll container for long lists whose rows have different heights, known only once they mount; it renders the rows in view and keeps what the person is reading still while sizes and rows change.
status: experimental
aliases: [Virtualized list, Windowed list, Infinite scroll]
layer: core
category: data-display
related: [message-list, scroll-area, task-board]
---

# VirtualList

VirtualList renders only the rows in or near the view of a long list, measures each row when it mounts and whenever it resizes, and keeps the rows in view still while sizes change, rows load above them or the list jumps. Use it for a history or a feed of thousands of rows of different heights: a channel, a log, an activity feed.

```example
virtual-list/compositions/basic
```

## When to use

| Situation                                                      | Use                                                                                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thousands of rows of different heights in one scrolling column | VirtualList                                                                                                                                          |
| The messages of a conversation that fits in the DOM            | [MessageList](../message-list/message-list.md)                                                                                                       |
| A long column of task cards on a board                         | VirtualList, or a virtualizer of your own inside the column's [ScrollArea](../scroll-area/scroll-area.md) ([TaskBoard](../task-board/task-board.md)) |
| Any other region that scrolls                                  | [ScrollArea](../scroll-area/scroll-area.md)                                                                                                          |

## Anatomy

- `VirtualList`: the scroll container. It is its own native scroller (`overflow-y: auto`), not a ScrollArea, and hides the native scrollbar unless `showScrollbar`. `data-slot="virtual-list"`.
  - `header`: optional, above the rows, inside the scroller.
  - The spacer, `data-slot="virtual-list-items"`: as tall as every row together, with `paddingTop` above the first row.
  - The rows, in `data-slot="virtual-list-visible-items"`: what `children` (a function) or `ItemComponent` renders for each item in view. Put `domRef` on the row's root element and spread `style` on it; `style` is set only for a row kept mounted outside the view.
  - `footer`, then `paddingBottom`: optional, below the rows.
  - `empty`: rendered instead of the spacer when there are no items, at the top or, with `emptyAlign="center"`, in the middle.
- `componentRef`: the `VirtualListApi`, with `scrollTo`, `getOffsetTopOfKey` and the scroller's element.

`getKey` gives each item a stable key; every measurement is kept by key, so it survives reordering and new items. Each measured row gets `data-virtual-list-item-key`. The list writes `--virtual-list-transform-y` (the rows' offset) on the rows' element and `--virtual-list-width` on the scroller, for sticky content inside a row to read.

## Behavior

### Heights

- Set `itemResizable` for rows whose height isn't fixed. Rows not yet mounted count as `itemEstimatedSize`; a row is measured before the browser paints it, and again whenever it resizes.
- Set `itemMinSize` to the shortest row's height or less: the list mounts as many rows as fit at that size, so a larger value leaves the end of the view empty.
- Rows are laid out in normal block flow, so their margins collapse as the CSS says: between neighboring rows, and a child's margin through a row with no border or padding of its own. The list measures the space each row takes, so rows need no `display: flow-root` or `gap`.

```example
virtual-list/compositions/margins
```

### Rows that change above the view

- Rows that mount above the view while the person scrolls up, and rows above the view that resize (an image loads, a reaction is added), have their size change scrolled away: the rows in view don't move. A row the view's top cuts through isn't compensated, because part of it is in view.
- With `keepAnchorOnItemsChange`, the row at the top of the view keeps its place when `items` change, so older rows loaded above it don't push the rows being read down. Load the next page when the person comes near the top. `canAnchorItem` excludes rows that new rows go below, such as a leading header row.

```example
virtual-list/compositions/load-older
```

### Jumps

- `scrollTo({ key, align })` (or `index`) puts the row's top at the view's top (`"start"`), its middle in the middle (`"center"`) or its bottom at the bottom (`"end"`), inside `scrollMarginTop` and `scrollMarginBottom`. The row lands exactly, and no other position is painted first, even when the row and its neighbors were never measured.
- A newer jump stops an older one. At the ends the position is clamped. With `behavior: "smooth"` the list scrolls once, to the position known when the jump starts.
- Without `align`, the list scrolls only as far as needed to show the row (`debounce`, the default), from its estimated offset.
- `scrollTo({ position: "top" | "bottom" })` goes to either end.

```example
virtual-list/compositions/jump
```

### Following the end

The list doesn't follow new rows on its own: whether to follow is the product's choice. To keep a chat at the newest message, track whether the person is at the bottom in `onScroll`, and while they are, call `scrollTo({ position: "bottom" })` when rows are added and from `onContentResize`, which runs when a row grows, such as a reply that streams in.

```example
virtual-list/compositions/chat
```

### Other behavior

- While text is selected, rows that scroll out of view stay mounted, so the selection and copying survive scrolling.
- `virtual={false}` renders every row in flow. With `itemResizable`, the row at the top of the view keeps its place when virtualization is switched off; switching it back on keeps the measurements, not the position.
- `columns` with `renderCol` or `renderItemWithCols` scrolls sideways too and renders only the columns in view.
- On iOS, size changes above the view during a fling are applied as a transform and written to the scroll position after it, because writing it stops the fling.
- A new `sessionId` resets the list: scroll position, measurements and rows.

## Accessibility

- VirtualList renders plain elements and adds no role. Give the list the semantics of what it holds, such as a named region around it. Only the rows in or near the view are in the DOM, so a screen reader can't count the others: say how many there are in the region's name or nearby when it matters.
- The scroller is in the tab order (`focusable`, on by default). Page Up, Page Down and Space (Shift+Space up) scroll by the view's height less 32px and `keyboardPageBottomOcclusion`; Home, End, Cmd+Up and Cmd+Down go to either end. Keys typed into a field inside a row are left alone.
- Find in page only finds rows in the DOM. Give a long history its own search.

## Rules

- Put `domRef` on the row's root element, the element the render function returns: the list finds rows among its own children, so a row with `domRef` on a nested element is never measured and the scroll position jumps as it is read.
- Keep `getKey` stable for an item across renders: a new key is a new row, measured again from the estimate.
- Keep the `header` the same height while rows load above: a change in its height moves the rows in view.

## Provenance

The implementation references DeepSeek web's virtual list implementation. Comments in the source that start "Unlike the reference implementation (DeepSeek web)" mark where it behaves differently: rows in block flow with collapsing margins, measured from layout, and the first row's top margin kept apart.
