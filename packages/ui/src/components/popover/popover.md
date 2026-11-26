---
title: Popover
summary: A small panel that opens next to the element people click, for a little input such as a choice, a field and a button.
status: stable
aliases: []
layer: core
category: overlays
related: [preview-card, tooltip, dropdown-menu, drawer]
---

# Popover

A popover is a small panel that opens next to the element people click and holds a little input: a choice of a few options, a field, a button. Snoozing a notification or renaming something fits in one. It closes on a click outside or Esc.

## When to use

| Situation                                               | Use                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| One sentence about something, on hover                  | [Tooltip](../tooltip/tooltip.md)                                                                       |
| A summary of a person or an agent, on hover, with links | [PreviewCard](../preview-card/preview-card.md)                                                         |
| The details of an item an app links to, on hover        | An item card ([PreviewCard](../preview-card/preview-card.md#item-card))                                |
| A little choice or input, on click (snooze, rename)     | Popover, with a [RadioGroup](../radio-group/radio-group.md), an [Input](../input/input.md) and buttons |
| A list of actions                                       | [DropdownMenu](../dropdown-menu/dropdown-menu.md)                                                      |
| Something that stays open and scrolls                   | [Drawer](../drawer/drawer.md)                                                                          |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

- `Popover`: the root. Owns the open state. Required.
- `PopoverTrigger`: the element that opens it. Required.
- `PopoverContent`: the panel, portaled and positioned next to the trigger, a column of its parts. `size="item"` makes it a popover about an app's item ([About an item](#about-an-item)). Required.
- `PopoverHeader`: a row with `PopoverTitle` and an optional `PopoverClose`.
- `PopoverTitle` and `PopoverDescription`: the title and a helper sentence under it. `PopoverDescription` takes only a `HelperText`, made with `helperText(content, { why, about })`, and renders its `why` and `about` as `data-why` and `data-about`, and is only for a consequence (`consequence`), who sees it or whom it affects (`audience`), or how to recover (`recovery`) ([Writing › Helper text](../../../../../design/content/writing.md#helper-text)); a status ("No comments yet") or data is body text.
- `PopoverBody`: the panel's text, a `PopoverTitle` and a `PopoverDescription`, or a list, 16px in from its edges (12px in a popover about an item). It is the part that scrolls when the panel runs out of room ([A long popover](#a-long-popover)). Experimental, from `@botiverse/raft-ui/wip`.
- `PopoverActions`: the panel's buttons at its end, under `PopoverBody`: the way out first, then the confirm button. Experimental, from `@botiverse/raft-ui/wip`.
- `PopoverSeparator`: a hairline between parts of the panel.
- `PopoverClose`: a button that closes the popover.
- `PopoverArrow`: an optional pointer toward the trigger, on whichever side the panel opens (`inline-start` and `inline-end` follow the direction Base UI placed the panel by, its `DirectionProvider`, `ltr` without one; a right-to-left page sets it, as for every Base UI part). The panel clips what overflows it, so a panel with an arrow lets it overflow (`overflow-visible`), as [CoachMark](../coach-mark/coach-mark.md) does.
- `PopoverBackdrop`: a transparent layer behind the panel that catches clicks outside it.
- `PopoverPortal`, `PopoverViewport` and `PopoverPopup`: lower-level parts. `PopoverPopup` is the panel surface without positioning.
- `isInsideOverlay(node)`: whether a node is inside a raft-ui overlay, this popover or any other; `closestOverlay(node)`: that overlay's portal container ([Inside an overlay](#inside-an-overlay)).
- `PortalContainerProvider` and `usePortalContainer()`: where every raft-ui overlay under the provider renders, for a part of the app drawn in another window ([Rendering in another window](#rendering-in-another-window)).

## Behavior

- The popover opens below its trigger, aligned to its start edge, and moves or flips when it meets the window edge ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- In a phone sheet or a drawer it stays under the sheet's head, unless its trigger is in the head; `collisionBoundary="clipping-ancestors"` opts it out ([Dialog](../dialog/dialog.md#popups-in-a-sheet)).
- The popover keeps clear of the frame insets: where a shell keeps part of the window for itself (`--raft-frame-inset-top`, `--raft-frame-inset-start`, `--raft-frame-inset-end`), it stops 8px from that part, not from the window's edge. The start and end insets are the corners of the top band, so they count only when its trigger is in the band; under it, it keeps its own padding from the window's edge ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)). The web sets none.
- The popover follows its trigger while the window or any ancestor pane scrolls or resizes, and closes (returning focus to the trigger when it is still on the page) if the trigger scrolls out of its clipping region or leaves the page ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- A click outside and Esc close it. A Cancel button closes it too. A click into an embedded frame (an `<iframe>`, cross-origin too) outside the panel counts as a click outside; one into a frame inside the panel doesn't. A tour's [CoachMark](../coach-mark/coach-mark.md), built on these parts, is the exception: a click outside leaves it open ([Coach marks](../../../../../design/patterns/coach-marks.md#focus-and-keys)).
- It has no scrim; the page behind it stays as it is.
- A popover longer than the room it has keeps its header and its actions and scrolls its body between them ([A long popover](#a-long-popover)).

### A long popover

A popover that lists something with no fixed length, such as who has read a document, can be taller than the room it has. It never runs past the window, and its header and buttons never scroll away.

- The panel is as tall as its parts, up to the room the positioner leaves it (`--available-height`). Past that, `PopoverBody` scrolls: it is a [ScrollArea](../scroll-area/scroll-area.md) that shrinks, while `PopoverHeader`, `PopoverSeparator` and `PopoverActions` keep their height. The panel's title says what the list is and its buttons act on it, so both stay in view however far the list is scrolled.
- The body's cut edges fade, over up to 24px toward an edge with more past it ([Edges fade](../../../../../design/foundations/spacing.md#edges-fade)).
- Overflowing, the body is a tab stop, so a keyboard can scroll it. When it holds a list rather than text, name it: `role="region"` and an `aria-label`.
- Put the whole list in one `PopoverBody`. A panel of your own parts is a flex column: a [ScrollArea](../scroll-area/scroll-area.md) in it shrinks by itself; give `min-h-0` to any box between the panel and the ScrollArea, so it can shrink too.
- A popover that keeps growing, or that people stay in, is a [Drawer](../drawer/drawer.md) instead.

```example
popover/compositions/long-list
```

### Inside an overlay

The panel is portaled out of the tree it was opened from, so `region.contains(event.target)` is false for a press in it, even when the popover belongs to the region. Where a handler of the page's own must leave the overlays' events alone (a shortcut on the page, a press outside a region that closes it, a drag that starts in a row), ask `isInsideOverlay(event.target)` from `@botiverse/raft-ui`: it is `true` for a node inside any raft-ui overlay (a popover, a menu, a select list, a combobox, a tooltip, a preview card, the notification center, a dialog, an alert dialog, a drawer, a lightbox or a toast), and `false` for a node of the page and for `null`. A text node counts by its parent element.

- Where the handler needs the overlay itself, not only whether there is one, ask `closestOverlay(event.target)`: the portal container of the innermost overlay the node is in, or `null`. For example, `closestOverlay(target)?.contains(region)` tells whether a press in an overlay is in the same overlay as a region the page draws in it.
- Every `…Portal` part marks its container with `data-raft-ui-overlay`, and an overlay opened from another is portaled into that one's container, so it is inside both. Read it through `isInsideOverlay`, never Base UI's own `[data-base-ui-portal]`, which is internal to Base UI.
- An overlay given a `container` of the page's own is still inside its portal container. A portal of the app's own (`createPortal`) and `DragLift`'s copy are not overlays.

### Rendering in another window

Base UI portals every overlay to the global `document.body`, the body of the window whose script runs. A part of the app drawn in a second window, such as a Raft Desktop window opened with `window.open("about:blank")` and filled with `createPortal` from the main window's React tree, would open its popovers, menus, tooltips and dialogs in the main window. Wrap that part in `PortalContainerProvider`, inside the `createPortal`, with an element of the second window's document:

```tsx
createPortal(
  <PortalContainerProvider container={auxWindow.document.body}>
    <SecondWindowContent />
  </PortalContainerProvider>,
  auxWindow.document.body,
);
```

- Every raft-ui overlay under it renders in that element: Popover, DropdownMenu, ContextMenu, Tooltip, PreviewCard, Select, Combobox, ComboboxSelect, NotificationCenter, Dialog, AlertDialog, Drawer, Lightbox, a `ToastProvider`'s viewport, `DragLift` and `DragRefusalHint`. With no provider nothing changes: they render in the page's body.
- Each overlay decides in this order: the `container` (or `portalProps.container`, a `ToastProvider`'s `portalContainer`) passed to it, then an overlay it is opened inside (Base UI renders it in that one's portal, as without a provider, so it stays inside it), then the provider's container, then the page's body.
- `container={null}` means the element doesn't exist yet: an overlay opened then renders nothing until it does, instead of opening in the wrong window.
- What the overlays measure or listen to follows the document they render in: the window's size and frame insets (`--raft-frame-inset-*`, read on that document's root element), its visual viewport, its media queries (where a dialog becomes a phone sheet), the on-screen keyboard, a press outside, focus, and the keys a coach mark or a lightbox takes. Base UI's own dismissal, scroll lock and focus return already follow the popup's document.
- The components that measure themselves or wait for a frame work in the second window too, and keep running while the main window is hidden (a hidden window stops its animation frames, throttles its timers and stops reporting its resize observers): ScrollArea's scroll bars, VirtualList, CommentMargin and `setCommentHighlights` (registered in the passages' own window), Ellipsis, `useTruncated` and the `title` a field gives a cut value, a Dialog's and an AlertDialog's footer stacking, DescriptionList and MessageActionCard deciding where labels go, SegmentedControl, ComboboxSelect, FitToolbar and BannerAction. Each takes its frames, timers, observers, focus, selection, fonts and key listeners from the window of the element it is about.
- For the page's own elements that window is the global `window`. A consumer test that stubs `requestAnimationFrame`, `ResizeObserver` or a timer must stub it on `window`: under `global-jsdom` `window` is not `globalThis`, and a stub set only on `globalThis` is not seen (the test fails, or passes without its stub).
- A toast raised in the second window shows there only through a `ToastProvider` of its own inside the subtree ([Toast](../toast/toast.md#toasts-in-another-window)).
- `usePortalContainer()` returns the provider's container (`undefined` with no provider), for a portal of the app's own that must follow the same rule: `createPortal(node, usePortalContainer() ?? document.body)`.
- The second window's document needs raft-ui's styles of its own (`styles.css`, with the theme), as any document does: an overlay carries its theme class (`light` or `dark`), not the stylesheet.

## Content

- Write button labels in sentence case, with the confirm button repeating the verb: Snooze, Rename ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).

## Accessibility

- Popover wraps the Base UI Popover. It provides the `dialog` role on the panel, moves focus into it on open, and returns focus to the trigger on Esc.
- Name the panel: `PopoverTitle` labels it. Without a visible title, put an `aria-label` on `PopoverContent`.
- Give an icon-only trigger an `aria-label`.

## Rules

- Make a popover 300px wide, with 16px padding. A popover about an app's item is the exception (`size="item"`, [About an item](#about-an-item)).
- Don't put a pink button in a popover. Confirm with an ink-border button (`variant="outline"`) and cancel with `variant="ghost"`: a popover is a small step, not the screen's primary action. The one exception is a tour's [CoachMark](../coach-mark/coach-mark.md), whose Next and Done are pink: at that moment it is the one thing to do ([Coach marks](../../../../../design/patterns/coach-marks.md#the-bubble)).

## About an item

A popover about an app's item, such as the question an app's link asks before it shows its previews ([PreviewCard](../preview-card/preview-card.md#item-card)), takes `size="item"`: it is 400px wide, and `PopoverBody`, `PopoverTitle` and `PopoverActions` take the parts of a card in a message, with its 12px inset and `text-subhead` title. It stands in for the item card the chip opens once the reader allows the app, so it looks like that card, not like the other popovers (stdrc, 2026-11-10): a popover belongs to the family of what it is about ([Cards in messages](../../../../../design/patterns/cards-in-messages.md#popovers)). Every other popover, one with a field, a choice or a short confirmation, keeps 300px and 16px: it is a small step of its own, not an item.
