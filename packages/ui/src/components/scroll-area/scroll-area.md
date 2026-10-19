---
title: ScrollArea
summary: A region with native scrolling and a thin drawn scrollbar that shows only while it scrolls, for lists and strips inside a fixed frame.
status: stable
aliases: [Scrollbar, Scroll view]
layer: core
category: layout
related: [message-list, panel, sidebar, composer]
---

# ScrollArea

ScrollArea scrolls its content natively and draws a thin scrollbar over the edge that shows only while the content moves, so the scrollbar takes no room from the layout. raft-ui uses it for the desktop message list, the sidebar and the composer's row of attachments.

```example
scroll-area/compositions/basic
```

## When to use

| Situation                                         | Use                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| A list or strip that scrolls inside a fixed frame | ScrollArea                                                                   |
| The content of a panel under its header           | `PanelScrollViewport` ([Panel](../panel/panel.md#anatomy))                   |
| The messages of a conversation or a thread        | [MessageList](../message-list/message-list.md), which is built on ScrollArea |
| A row of tabs that doesn't fit                    | [Tabs](../tabs/tabs.md#behavior), which scrolls on its own                   |
| A Markdown table wider than the text              | `MarkdownTableScroll` ([Markdown](../markdown/markdown.md))                  |

## Anatomy

- `ScrollArea`: the frame. Give it the size of the region. Required.
- `ScrollAreaViewport`: the element that scrolls. Required.
- `ScrollAreaContent`: the content, at least as tall as the viewport. Required.
- `ScrollAreaScrollbar`: a track over one edge, vertical by default. Add a second with `orientation="horizontal"` for content that scrolls both ways.
- `ScrollAreaThumb`: the 6px handle in the track, in translucent ink. Required inside each scrollbar.
- `ScrollAreaCorner`: the square where two scrollbars meet. Only with both.

```example
scroll-area/compositions/both-axes
```

## States

| State       | Look                                                                |
| ----------- | ------------------------------------------------------------------- |
| At rest     | No scrollbar. The track doesn't catch the pointer                   |
| Scrolling   | The scrollbar shows at once and fades out after the scrolling stops |
| Thumb hover | The thumb darkens                                                   |

## Behavior

- Scrolling is the browser's own: wheel, trackpad, touch and keyboard scroll the viewport as usual.
- Scrolling stops at the end of the area and doesn't carry on to the page behind it.
- The viewport keeps the visible content in place when content above it changes size.

## Accessibility

- ScrollArea wraps Base UI `ScrollArea`. The viewport becomes focusable while its content overflows, so keyboard users can scroll it with the arrow keys, Page Up and Page Down.
- The viewport has no role of its own. Name and structure the content inside it, such as a list with an `aria-label`.

## Rules

- Give each region one scroll container: the header stays put and only the content scrolls ([Panel](../panel/panel.md#behavior)).
- Size the frame, not the content: a ScrollArea without a height grows with its content and never scrolls.
