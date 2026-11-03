---
title: ScrollArea
summary: A region with native scrolling and thin overlay scrollbars that look the same on every platform, for lists, strips and panes inside a fixed frame.
status: stable
aliases: [Scrollbar, Scroll view]
layer: core
category: layout
related: [message-list, panel, sidebar, composer]
---

# ScrollArea

ScrollArea scrolls its content natively and draws thin overlay scrollbars in the style of macOS: a rounded thumb in the label colour made translucent, with no visible track, that fades in while the area scrolls or is pointed at, thickens when you point at it, and fades out shortly after. The scrollbars take no room from the layout and look the same in every theme and on every platform: a translucent label colour is dark on a light page and light on a dark one, so the thumb reads on any content without a track behind it. The wheel, trackpad, touch and keyboard scroll as usual; the thumb can also be dragged, and a press on the empty rail beside it pages. raft-ui uses it for the desktop message list, the sidebar and the composer's row of attachments.

ScrollArea is one element: the area itself is the scroll container, so a `ref` gets the native `scrollTo` and `scrollBy`, and `onScroll` receives its scroll events.

```example
scroll-area/compositions/basic
```

## When to use

| Situation                                               | Use                                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A list, strip or pane that scrolls inside a fixed frame | ScrollArea                                                                   |
| A `<textarea>` that should show the same scrollbar      | `ScrollAreaTextarea`                                                         |
| The content of a panel under its header                 | `PanelScrollViewport` ([Panel](../panel/panel.md#anatomy))                   |
| The messages of a conversation or a thread              | [MessageList](../message-list/message-list.md), which is built on ScrollArea |
| A list long enough that rendering every row is too slow | [VirtualList](../virtual-list/virtual-list.md)                               |
| A row of tabs that doesn't fit                          | [Tabs](../tabs/tabs.md#behavior), which scrolls on its own                   |
| A Markdown table wider than the text                    | `MarkdownTableScroll` ([Markdown](../markdown/markdown.md))                  |

## Anatomy

- `ScrollArea`: the scroll container. Give it the size of the region (a height, a `max-height`, or a flex item's share). Its children go in a content element inside it: put padding there with `contentClassName` or `contentStyle`, not on the area itself, so the scrollbars stay at the edges.
- The scrollbars: drawn by ScrollArea over the right edge (vertical) and the bottom edge (horizontal), hidden from assistive technology. There are no parts to add.
- `ScrollAreaTextarea`: a native `<textarea>` with the same scrollbar, in a wrapper that holds both.

## Variants

| Prop          | Values                                     | Use for                                                                                                                                                                                                 |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `vertical` (default), `horizontal`, `both` | The directions the area scrolls in, each with its own scrollbar. Content too wide for a vertical area is cut off. With both, each scrollbar stops short of the corner, and the corner stays transparent |
| `trigger`     | `hover` (default), `scroll`, `none`        | When the scrollbars show: while the pointer is over the area or it scrolls; only while it scrolls (the message list, the sidebar, the attachments row); or always                                       |
| `size`        | `medium` (default), `small`                | The thumb's thickness: 7px or 5px at rest, 3px more while pointed at or dragged. `small` for a short strip                                                                                              |
| `fade`        | `false` (default), `true`                  | The content fades out over up to 24px toward each edge with more past it. For short areas: the fade repaints the content while it scrolls                                                               |
| `overscroll`  | `none` (default), `contain`, `auto`        | What a scroll does at the end: stop with no bounce; stop, but let a Mac trackpad or iOS bounce the area; or carry on to the page behind                                                                 |

```example
scroll-area/compositions/orientation
```

```example
scroll-area/compositions/trigger
```

```example
scroll-area/compositions/size
```

```example
scroll-area/compositions/fade
```

## States

| State             | Look                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing to scroll | No scrollbar, and the area is no tab stop                                                                                                                                    |
| At rest           | With `trigger="hover"` or `"scroll"`, no scrollbar; with `"none"`, the thumb at 42% of `foreground`                                                                          |
| Hover             | With `trigger="hover"`, the scrollbars fade in over 120ms                                                                                                                    |
| Scrolling         | The scrollbars show with every trigger, and fade out over 400ms once `hideDelay` (600ms by default, at least 100ms with `trigger="scroll"`) has passed since the last scroll |
| Thumb pointed at  | The thumb thickens by 3px and darkens to 58% of `foreground`                                                                                                                 |
| Thumb dragged     | As pointed at, until the drag ends; the area scrolls in proportion                                                                                                           |
| Keyboard focus    | The focus ring (`--focus-ring`) around the area                                                                                                                              |

### Edge state

While there is more content past an edge, the area carries a modifier class for it: `r-scroll-area--overflow-y-start` (above), `--overflow-y-end` (below), `--overflow-x-start` and `--overflow-x-end` (the inline start and end, so the right and left edges in right-to-left layouts). Style dividers or "more" hints from them, such as a hairline under a sticky header once rows have scrolled under it. `onEdgeChange` is called with `{ top, bottom, left, right }` (`true` when the area is scrolled all the way to that edge) whenever one of them flips, and right after mounting when the content overflows.

A header or footer stuck inside the area (`position: sticky`) covers its ends, so give its height to `railInset`: `railInset={{ top: 40, bottom: 40 }}` starts the vertical scrollbar below the header and ends it above the footer. `left` and `right` do the same for the horizontal scrollbar, such as beside a sticky first column. The same room can come from CSS, set on the area itself: `--r-scroll-area-rail-inset-top`, `-bottom`, `-left` and `-right`. They don't inherit, so a scroll area nested inside doesn't take them.

```example
scroll-area/compositions/edge-state
```

## Behavior

- Scrolling is the browser's own: wheel, trackpad, touch and keyboard scroll the area as usual. Dragging the thumb scrolls in proportion; a press on the rail beside the thumb pages toward the press, by most of a viewport (smoothly, unless the reader asks for reduced motion).
- By default a scroll that reaches the end stops there: it doesn't carry on to the page behind it, and doesn't bounce the area (and its sticky header or footer) on a Mac trackpad or iOS. `none` and `contain` hold only in a direction where the content overflows right now, so an area that only overflows sideways never stops the page from scrolling down.
- With `trigger="scroll"` a hidden scrollbar doesn't catch presses meant for the content under it. A scrollbar the pointer is already on stays visible and usable after `hideDelay`, until the pointer leaves it.
- While scrolling, the scrollbars update in each scroll event without a React render, and nothing is written on the area (with `fade`, only the content's mask moves). The area re-renders, not its children, only when an edge flips or scrolling starts or stops.

```example
scroll-area/compositions/overscroll
```

### Scrolling from code

The area is the scrolling element, so a `ref` gets the native `scrollTo` and `scrollBy`, and `onScroll` receives its events.

```example
scroll-area/compositions/scroll-to
```

`actionsRef` gets `scrollToElement(element, options)`, which scrolls the area, and only the area (`scrollIntoView` would scroll the page too), so that an element inside it is in view. `block` lines the element up at the `start` (the default), `center` or `end`, or `nearest` scrolls only as far as needed. `offset` keeps that many px clear between the element and the edge, such as the height of a sticky header (give the same height to `railInset`, so the scrollbar starts below it too); `behavior: "smooth"` animates the scroll. In a `horizontal` area `block` and `offset` apply to the horizontal axis; with `both`, the horizontal axis scrolls only as far as needed.

```example
scroll-area/compositions/scroll-to-element
```

### Textarea

A `<textarea>` scrolls itself and can't hold the scrollbar, so `ScrollAreaTextarea` wraps a native textarea and lays the same scrollbar over it. Frame the wrapper (`wrapperClassName`: border, background, focus ring) and pad the textarea (`className`); the scrollbar follows typing, pasting and a controlled `value`. Drag the bottom corner to make the textarea taller: the scrollbar stops above the grip so it stays reachable. `ref`, `className`, `style`, `value`, `onScroll` and every other native prop go to the textarea; it takes `trigger`, `hideDelay`, `size` and `overscroll` as ScrollArea does.

```example
scroll-area/compositions/textarea
```

## Styling

ScrollArea is plain CSS (`scroll-area.css`, in the `components` layer, shipped in `styles.css`), so a utility in its `className` overrides it. Its classes are `r-scroll-area` with the modifiers above, and `__content` for the element around the children. The look is set by variables on the area: `--r-scroll-area-thumb-size-{small,medium}` and `-thumb-size-hover-{small,medium}`, `--r-scroll-area-thumb-color` and `-thumb-color-hover`, `--r-scroll-area-rail-gap` (3px, between the thumb and the edge) and `--r-scroll-area-fade-size`.

## Accessibility

- ScrollArea is not built on a Base UI primitive: it is a native scroll container, so assistive technology and the keyboard use the browser's own scrolling. The drawn scrollbars are `aria-hidden`.
- When there is something to scroll, the area is focusable (`tabIndex={0}`), so keyboard users can scroll it with the arrow keys, Page Up and Page Down; give it an `aria-label` that says what it holds, or name the content inside it, such as a list with an `aria-label`. Pass `tabIndex={-1}` when every item inside takes focus itself and scrolls into view, as the attachments row does.

## Rules

- Give each region one scroll container: the header stays put and only the content scrolls ([Panel](../panel/panel.md#behavior)).
- Size the area, not the content: a ScrollArea without a height grows with its content and never scrolls.
- Pad the content (`contentClassName`), not the area, so the scrollbars stay at the area's edges.
- Give a sticky header or footer inside the area its height in `railInset`, so the scrollbar doesn't run over it.
